import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import * as j2xOptions from "../../../config/j2xOptions.json";
import * as x2jOptions from "../../../config/x2jOptions.json";

export default class Decomposer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:customlabels:decompose -p {sourcepath} -d {outputdirectory}
  Decompose Custom Labels xml file to multiple custom label files
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

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Decomposing Custom Labels"));
    try {
      this.decompose(this.flags.sourcepath, this.flags.outputdir);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }
    this.ux.stopSpinner("✔️");
    // Return an object to be displayed with --json
    return { success: true };
  }

  public async decompose(sourcepath, outputdir) {
    let xmlData = await fs.readFileSync(sourcepath, {
      encoding: "utf8",
    });

    if (x2jParser.validate(xmlData) === true) {
      // parse xml to json
      let jsonObj = x2jParser.parse(xmlData, x2jOptions);
      // init the json to xml parser
      let json2xmlParser = new j2xParser(j2xOptions);

      // loop through the label
      for (const element of jsonObj.CustomLabels.labels) {
        let formattedXml = json2xmlParser.parse({
          label: element,
        });
        // write xml file
        await fs.writeFileSync(
          `${outputdir}/${element.fullName}.xml`,
          formattedXml,
          {
            encoding: "utf8",
          }
        );
      }
    } else {
      throw `${sourcepath} is an invalid xml file`;
    }
  }
}
