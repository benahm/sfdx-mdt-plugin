import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as x2jParser from "fast-xml-parser";
import * as path from "path";
import { j2xParser } from "fast-xml-parser";

import { j2xOptions, x2jOptions } from "../../../config/fastXMLOptions";

import {
  substringBefore,
  readFile,
  mkdirRecursive,
  rmRecursive,
  writeXMLFile,
} from "../../../utils/utilities";

export default class Cleaner extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:flow:decompose -p {sourcepath} [-d {outputdirectory}]
  decompose a flow xml file
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
      description: "The output directory that stores the decomposed xml files",
    }),
  };

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Decomposing Flow"));
    try {
      await this.decompose(
        this.flags.sourcepath,
        this.flags.outputdir
      );
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }
    this.ux.stopSpinner("✔️");
    // Return an object to be displayed with --json
    return { success: true };
  }

  public async decompose(
    sourcepath: string,
    outputdir: string
  ) {
    const flowXML: string = await readFile(sourcepath);
    const flowName: string = substringBefore(path.basename(sourcepath), ".");
    const destpath: string = outputdir
      ? `${outputdir}/${flowName}`
      : `${path.basename(sourcepath)}/${flowName}`;

    await rmRecursive(destpath)
    await mkdirRecursive(destpath)

    const json2xmlParser = new j2xParser(j2xOptions);
    const notArrayElements = ['@', 'apiVersion', 'description', 'environments', 'fullName', 'interviewLabel', 'isAdditionalPermissionRequiredToRun', 'isTemplate', 'label', 'migratedFromWorkflowRuleName', 'processType', 'runInMode', 'start', 'startElementReference', 'status', 'triggerOrder']
    
    let flowBase = {}
    if (x2jParser.validate(flowXML) === true) {
      // parse xml to json
      const flowJSON = x2jParser.parse(flowXML, x2jOptions);
      for (const element in flowJSON.Flow) {
        const elementContent = flowJSON.Flow[element];
        if (notArrayElements.includes(element)) {
          flowBase[element] = elementContent
        } else {
          if (Array.isArray((elementContent))) {
            for (const arrElementContent of elementContent) {
              const elementName = arrElementContent?.name
              if (elementName) {
                const flowElementXML: string = json2xmlParser.parse({
                  Flow: arrElementContent
                });
                await writeXMLFile(`${destpath}/${element}.${elementName}.meta.xml`, flowElementXML);
              } else {
                console.log(`Warning : ${element} has no name attribut`)
              }
            }
          } else {
            const elementName = elementContent?.name
            if (elementName) {
              const flowElementXML: string = json2xmlParser.parse({
                Flow: elementContent
              });
              await writeXMLFile(`${destpath}/${element}.${elementName}.meta.xml`, flowElementXML);
            } else {
              console.log(`Warning : ${element} has no name attribut`)
            }
          }
        }
      }

      const flowBaseXML: string = json2xmlParser.parse({
        Flow: flowBase
      });

      // write xml version & encoding
      await writeXMLFile(`${destpath}/${path.basename(sourcepath)}`, flowBaseXML);
    } else {
      throw `${flowXML} is an invalid xml file`;
    }
  }
}
