import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as path from "path";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import {
  substringBefore,
  readFile,
  writeXMLFile,
  escapeXML,
  unescapeXML,
  isObject,
} from "../../../utils/utilities";

import { j2xOptions, x2jOptions } from "../../../config/fastXMLOptions";

export default class Retriever extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:translations:mergeretrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
  Retrieve all translations related to a given language and merge it to the local file
  `,
  ];

  protected static flagsConfig = {
    sourcepath: flags.string({
      char: "p",
      required: true,
      description: "The path to the source metadata translation file",
    }),
    outputdir: flags.string({
      char: "d",
      description:
        "The output directory where to store the translations metadata file",
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Retrieving Translations"));

    try {
      await this.retrieve(this.flags.sourcepath, this.flags.outputdir);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }

    this.ux.stopSpinner("✔️");

    // Return an object to be displayed with --json
    return { success: true };
  }

  public async retrieve(sourcepath: string, outputdir: string) {
    // escape xml
    j2xOptions.tagValueProcessor = (a) => escapeXML(a.toString());

    // unescape xml
    x2jOptions.tagValueProcessor = (a) => unescapeXML(a.toString());

    const json2xmlParser = new j2xParser(j2xOptions);
    const translationsXMLData: string = await readFile(sourcepath);
    const conn = this.org.getConnection();
    const languageCode: string = substringBefore(
      path.basename(sourcepath),
      "."
    );
    const destpath: string = outputdir
      ? `${outputdir}/${languageCode}.translation-meta.xml`
      : sourcepath;

    // read translations from org
    const translationsJSON = await conn.metadata.readSync("Translations", [
      languageCode,
    ]);

    // read translations from local
    let localTranslationsJSON;
    if (x2jParser.validate(translationsXMLData) === true) {
      localTranslationsJSON = x2jParser.parse(translationsXMLData, x2jOptions);
    } else {
      throw `${sourcepath} is an invalid xml file`;
    }

    const retrievedTranslationsJSON = {
      Translations: {
        "@": {
          xmlns: "http://soap.sforce.com/2006/04/metadata",
        },
        ...translationsJSON,
      },
    };

    // merge translations
    for (const key in localTranslationsJSON.Translations) {
      let transItems = localTranslationsJSON.Translations[key];
      let rTransItems = retrievedTranslationsJSON.Translations[key];
      if (rTransItems && !Array.isArray(rTransItems)) {
        rTransItems = [rTransItems];
      }
      if (key !== "@" && isObject(transItems)) {
        transItems = [transItems];
      }
      if (Array.isArray(transItems)) {
        let mergedItems = [];
        for (const transItem of transItems) {
          const itemFound = rTransItems?.find((item) => {
            return (
              (item.name && item.name === transItem.name) ||
              (item.fullName && item.fullName == transItem.fullName)
            );
          });
          if (itemFound) {
            mergedItems.push(itemFound);
          } else {
            mergedItems.push(transItem);
          }
        }
        if (rTransItems) {
          for (const transItem of rTransItems) {
            const itemFound = mergedItems.find((item) => {
              return (
                (item.name && item.name === transItem.name) ||
                (item.fullName && item.fullName == transItem.fullName)
              );
            });
            if (!itemFound) {
              mergedItems.push(transItem);
            }
          }
        }
        // sort
        localTranslationsJSON.Translations[key] = mergedItems.sort((a, b) => {
          if (a.name && b.name) {
            return a.name > b.name ? 1 : -1;
          }
          if (a.fullName && b.fullName) {
            return a.fullName > b.fullName ? 1 : -1;
          }
        });
      }
    }

    const formattedXml: string = json2xmlParser.parse(localTranslationsJSON);

    // write xml file
    await writeXMLFile(`${destpath}`, formattedXml);
  }
}
