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
  writeXMLFile,
  profileAccessFilenamesCompare,
} from "../../../utils/utilities";

export default class Orderer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:reorder -p {sourcepath} 
  Reorder Profile xml file
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
    this.ux.startSpinner(chalk.yellowBright("Reordering Profile"));
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

  public async reorder(sourcepath: string, outputdir: string) {
    const profileXML: string = await readFile(sourcepath);
    const profileName: string = substringBefore(path.basename(sourcepath), ".");
    const destpath: string = outputdir
      ? `${outputdir}/${profileName}.profile-meta.xml`
      : sourcepath;

    if (x2jParser.validate(profileXML) === true) {
      // parse xml to json
      const profileJSON = x2jParser.parse(profileXML, x2jOptions);

      for (const accesstype in profileJSON.Profile) {
        // reorder
        const accessList = profileJSON.Profile[accesstype];
        if (Array.isArray(accessList)) {
          profileJSON.Profile[
            accesstype
          ] = accessList.sort((access1, access2) =>
            profileAccessFilenamesCompare(accesstype, access1, access2)
          );
        }
      }

      // init the json to xml parser
      const json2xmlParser = new j2xParser(j2xOptions);

      // parse json to xml
      const formattedXml: string = json2xmlParser.parse(profileJSON);

      // write xml version & encoding
      await writeXMLFile(`${destpath}`, formattedXml);
    } else {
      throw `${sourcepath} is an invalid xml file`;
    }
  }
}
