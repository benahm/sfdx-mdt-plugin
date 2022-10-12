import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as x2jParser from "fast-xml-parser";
import * as path from "path";
import * as fs from "fs";
import { j2xParser } from "fast-xml-parser";

import { j2xOptions, x2jOptions } from "../../../config/fastXMLOptions";

import {
  substringBefore,
  readFile,
  readFolder,
  writeXMLFile,
} from "../../../utils/utilities";

export default class Composer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:flow:compose -d {inputdirectory} [-p {targetpath}]
  compose a flow xml file
  `,
  ];

  protected static flagsConfig = {
    inputdir: flags.string({
      char: "d",
      required: true,
      description: "The input directory that contains the decomposed xml files",
    }),
    targetpath: flags.string({
      char: "p",
      description: "The path to the target metadata file",
    }),
  };

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Composing Flow"));
    try {
      await this.compose(this.flags.inputdir, this.flags.targetpath);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }
    this.ux.stopSpinner("✔️");
    // Return an object to be displayed with --json
    return { success: true };
  }

  public async compose(inputdir: string, targetpath: string) {
    const json2xmlParser = new j2xParser(j2xOptions);
    const destpath: string = targetpath
      ? targetpath
      : `${path.dirname(inputdir)}/${path.basename(inputdir)}.flow-meta.xml`;
    const flowXMLPartNames: string[] = await readFolder(inputdir);

    let flowXMLMainPart;

    const flowXMLPartNamesFiltered = flowXMLPartNames.filter((value) =>
      value.endsWith(".meta.xml")
    );

    const flowXMLMainPartPath: string = `${inputdir}/${path.basename(
      inputdir
    )}.flow-meta.xml`;
    if (fs.existsSync(`${flowXMLMainPartPath}`)) {
      flowXMLMainPart = await readFile(`${flowXMLMainPartPath}`);
    } else {
      throw `${inputdir} should contains the ${flowXMLMainPartPath} xml file`;
    }

    const flowJSON = x2jParser.parse(flowXMLMainPart, x2jOptions);

    for (const flowXMLPartName of flowXMLPartNamesFiltered) {
      const flowXMLPart: string = await readFile(
        `${inputdir}/${flowXMLPartName}`
      );
      const element: string = substringBefore(flowXMLPartName, ".");
      if (x2jParser.validate(flowXMLPart) === true) {
        // parse xml to json
        const flowJSONPart = x2jParser.parse(flowXMLPart, x2jOptions);
        if (flowJSON.Flow[element]) {
          flowJSON.Flow[element].push(flowJSONPart.Flow);
        } else {
          flowJSON.Flow[element] = [flowJSONPart.Flow];
        }
      } else {
        throw `${inputdir}/${flowXMLPartName} is an invalid xml file`;
      }
    }

    flowJSON.Flow.apiVersion = `${flowJSON.Flow.apiVersion}.0`;

    // convert to xml
    const formattedXml = json2xmlParser.parse({
      Flow: JSON.parse(
        JSON.stringify(
          Object.keys(flowJSON.Flow)
            .sort()
            .reduce((r, k) => ((r[k] = flowJSON.Flow[k]), r), {})
        )
      ),
    });

    // write xml file
    await writeXMLFile(`${destpath}`, formattedXml);
  }
}
