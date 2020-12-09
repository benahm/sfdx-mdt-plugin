import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import { j2xOptions, x2jOptions } from "../../../config/fastXMLOptions";

import { readFile, writeXMLFile } from "../../../utils/utilities";

export default class Orderer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:customlabels:reorder -p {sourcepath} 
  Reorder Custom Labels xml file
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
      description: "The output directory that stores metadata files",
    }),
  };

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Reordering Custom Labels"));
    try {
      await this.reorder(this.flags.sourcepath, this.flags.outputdir);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }
    this.ux.stopSpinner("✔️");
    // Return an object to be displayed with --json
    return { success: true };
  }

  public async reorder(sourcepath, outputdir) {
    const customLabelsXML = await readFile(sourcepath);
    const destpath = outputdir
      ? `${outputdir}/CustomLabels.labels-meta.xml`
      : sourcepath;

    if (x2jParser.validate(customLabelsXML) === true) {
      // parse xml to json
      const customLabelsJSON = x2jParser.parse(customLabelsXML, x2jOptions);

      // reorder
      customLabelsJSON.CustomLabels.labels = customLabelsJSON.CustomLabels.labels.sort(
        (label1, label2) => (label1.fullName > label2.fullName ? 1 : -1)
      );

      // init the json to xml parser
      const json2xmlParser = new j2xParser(j2xOptions);

      // parse json to xml
      const formattedXml = json2xmlParser.parse(customLabelsJSON);

      // write xml version & encoding
      await writeXMLFile(`${destpath}`, formattedXml);
    } else {
      throw `${sourcepath} is an invalid xml file`;
    }
  }
}
