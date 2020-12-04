import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import { j2xOptions, x2jOptions } from "../../../config/fastXMLOptions";

import { readFile, writeXMLFile } from "../../../utils/utilities";

export default class Composer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:customlabels:compose -p {sourcepath} -d {outputdirectory}
  Compose multiple custom label files into a Custom Label xml file
  `,
  ];

  protected static flagsConfig = {
    sourcepath: flags.string({
      char: "p",
      description: "The path to the source metadata file",
    }),
    inputdir: flags.string({
      char: "d",
      description:
        "The input directory that stores the decomposed metadata files",
    }),
  };

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Composing Custom Labels"));

    try {
      await this.compose(this.flags.sourcepath, this.flags.inputdir);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }

    this.ux.stopSpinner("✔️");

    // Return an object to be displayed with --json
    return { success: true };
  }

  public async compose(sourcepath, inputdir) {
    const customLabelsDir = await fs.readdirSync(inputdir);
    const json2xmlParser = new j2xParser(j2xOptions);
    const customLabelsJSON = {
      CustomLabels: {
        "@": {
          xmlns: "http://soap.sforce.com/2006/04/metadata",
        },
        labels: [],
      },
    };

    if (!fs.existsSync(inputdir)) {
      throw `${inputdir} does not exists`;
    }

    for (const customLabelFile of customLabelsDir.sort()) {
      const xmlCustomLabel = await readFile(`${inputdir}/${customLabelFile}`);
      if (x2jParser.validate(xmlCustomLabel) === true) {
        const jsonCustomLabel = x2jParser.parse(xmlCustomLabel, x2jOptions);
        customLabelsJSON.CustomLabels.labels.push(jsonCustomLabel.label);
      } else {
        throw `${inputdir}/${customLabelFile} is an invalid xml file`;
      }
    }

    // parse json to xml
    const formattedXml = json2xmlParser.parse(customLabelsJSON);

    // write xml version & encoding
    await writeXMLFile(`${sourcepath}`, formattedXml);
  }
}
