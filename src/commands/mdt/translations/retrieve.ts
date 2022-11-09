import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as path from "path";
import { j2xParser } from "fast-xml-parser";

import { substringBefore, writeXMLFile } from "../../../utils/utilities";

import { j2xOptions } from "../../../config/fastXMLOptions";

export default class Retriever extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:translations:retrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
  Retrieve all translations related to a given language
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
    j2xOptions.tagValueProcessor = (a) => {
      return a
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };
    const json2xmlParser = new j2xParser(j2xOptions);
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

    const formattedXml: string = json2xmlParser.parse({
      Translations: {
        "@": {
          xmlns: "http://soap.sforce.com/2006/04/metadata",
        },
        ...translationsJSON,
      },
    });

    // write xml file
    await writeXMLFile(`${destpath}`, formattedXml);
  }
}
