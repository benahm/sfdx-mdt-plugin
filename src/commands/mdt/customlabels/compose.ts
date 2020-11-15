import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import * as j2xOptions from "../../../config/j2xOptions.json";
import * as x2jOptions from "../../../config/x2jOptions.json";

export default class Composer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:customlabels:compose -p {sourcepath} -d {outputdirectory}
  Compose multiple custom label file into the Custom Label xml file in order to deploy
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
      this.compose(this.flags.sourcepath, this.flags.inputdir);
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
    let customLabelsDir = await fs.readdirSync(inputdir);
    let json2xmlParser = new j2xParser(j2xOptions);
    let customLabelsJSON = {
      CustomLabels: {
        "@": {
          xmlns: "http://soap.sforce.com/2006/04/metadata",
        },
        labels: [],
      },
    };
    for (const customLabelFile of customLabelsDir.sort()) {
      let xmlData = await fs.readFileSync(inputdir + "/" + customLabelFile, {
        encoding: "utf8",
      });
      if (x2jParser.validate(xmlData) === true) {
        let jsonObj = x2jParser.parse(xmlData, x2jOptions);
        customLabelsJSON.CustomLabels.labels.push(jsonObj.label);
      } else {
        throw `${inputdir + "/" + customLabelFile} is an invalid xml file`;
      }
    }

    // parse json to xml
    let formattedXml = json2xmlParser.parse(customLabelsJSON);

    // write xml version & encoding
    await fs.writeFileSync(
      `${sourcepath}`,
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      {
        encoding: "utf8",
      }
    );

    // write xml file
    await fs.writeFileSync(`${sourcepath}`, formattedXml, {
      encoding: "utf8",
      flag: "a",
    });
  }
}
