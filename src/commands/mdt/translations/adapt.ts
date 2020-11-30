import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import { substringBefore } from "../../../utils/utilities";
import { filterMetadataTypeTag } from "../../../utils/adapt";
import { j2xOptions, x2jOptions } from "../../../config/fastXMLOptions";

export default class Adapter extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:transalations:adapt -p {sourcepath} -d {outputdirectory}
    Adapt a transalations to be deployed to an org
  `,
  ];

  protected static flagsConfig = {
    sourcepath: flags.string({
      char: "p",
      description: "The path to the source metadata file",
    }),
    outputdir: flags.string({
      char: "d",
      description:
        "The output directory to store the decomposed metadata files",
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Adapting Translations"));

    try {
      await this.adapt(this.flags.sourcepath, this.flags.outputdir);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }

    this.ux.stopSpinner("✔️");

    // Return an object to be displayed with --json
    return { success: true };
  }

  public async adapt(sourcepath, outputdir) {
    const translationsXMLData = await fs.readFileSync(sourcepath, {
      encoding: "utf8",
    });
    const json2xmlParser = new j2xParser(j2xOptions);
    const languageCode = substringBefore(path.basename(sourcepath), ".");
    const destpath = outputdir
      ? `${outputdir}/${languageCode}.translation-meta.xml`
      : sourcepath;
    let translationsJSON;
    if (x2jParser.validate(translationsXMLData) === true) {
      // parse xml to json
      translationsJSON = x2jParser.parse(translationsXMLData, x2jOptions);

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "customApplications",
        "CustomApplication",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "customLabels",
        "CustomLabel",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "customPageWebLinks",
        "CustomPageWebLink",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "customTabs",
        "CustomTab",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "flowDefinitions",
        "Flow",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "globalPicklists",
        "GlobalPicklist",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "prompts",
        "Prompt",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "quickActions",
        "QuickAction",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "reportTypes",
        "ReportType",
        (translation) => translation["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "scontrols",
        "Scontrol",
        (translation) => translation["name"]
      );
    }

    // convert to xml
    const formattedXml = json2xmlParser.parse(translationsJSON);

    // write xml version & encoding
    await fs.writeFileSync(
      `${destpath}`,
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      {
        encoding: "utf8",
      }
    );

    // write xml file
    await fs.writeFileSync(`${destpath}`, formattedXml, {
      encoding: "utf8",
      flag: "a",
    });
  }
}
