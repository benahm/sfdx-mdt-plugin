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
} from "../../../utils/utilities";
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
      required: true,
      description: "The path to the source metadata file",
    }),
    outputdir: flags.string({
      char: "d",
      description:
        "The output directory where to store the translations metadata file",
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

  public async adapt(sourcepath: string, outputdir: string) {
    const translationsXMLData: string = await readFile(sourcepath);
    const json2xmlParser = new j2xParser(j2xOptions);
    const languageCode: string = substringBefore(
      path.basename(sourcepath),
      "."
    );
    const destpath: string = outputdir
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
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "customLabels",
        "CustomLabel",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "customPageWebLinks",
        "CustomPageWebLink",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "customTabs",
        "CustomTab",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "flowDefinitions",
        "Flow",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "globalPicklists",
        "GlobalPicklist",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "prompts",
        "Prompt",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "quickActions",
        "QuickAction",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "reportTypes",
        "ReportType",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        translationsJSON.Translations,
        "scontrols",
        "Scontrol",
        (metadataTypeList, translation) =>
          metadataTypeList.includes(translation["name"])
      );
    }

    // convert to xml
    const formattedXml = json2xmlParser.parse(translationsJSON);

    // write xml file
    await writeXMLFile(`${destpath}`, formattedXml);
  }
}
