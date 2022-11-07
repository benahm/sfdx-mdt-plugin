import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as path from "path";
import * as he from "he";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import {
  substringBefore,
  readFile,
  writeXMLFile,
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
    const json2xmlParser = new j2xParser(j2xOptions);
    const translationsXMLData: string = await readFile(sourcepath);
    j2xOptions.tagValueProcessor = (a) => he.escape(a);
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

    const mergedTranslationsJSON = Object.assign(
      {},
      localTranslationsJSON,
      retrievedTranslationsJSON
    );

    const formattedXml: string = json2xmlParser.parse(mergedTranslationsJSON);

    // write xml file
    await writeXMLFile(`${destpath}`, formattedXml);
  }
}
