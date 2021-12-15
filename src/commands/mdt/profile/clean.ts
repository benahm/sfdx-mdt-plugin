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

export default class Cleaner extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:clean -p {sourcepath} -l {cleansourcepath} [-d {outputdirectory}]
  Clean Profile xml file
  `,
  ];

  protected static flagsConfig = {
    sourcepath: flags.string({
      char: "p",
      required: true,
      description: "The path to the source metadata file",
    }),
    cleansourcepath: flags.string({
      char: "l",
      description: "The path to the file that list the profile access to clean",
    }),
    outputdir: flags.string({
      char: "d",
      description: "The output directory that stores metadata files",
    }),
  };

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Cleaning Profile"));
    try {
      await this.clean(
        this.flags.sourcepath,
        this.flags.cleansourcepath,
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

  public async clean(
    sourcepath: string,
    cleansourcepath: string,
    outputdir: string
  ) {
    const profileXML: string = await readFile(sourcepath);
    const cleanXML: string = await readFile(cleansourcepath);
    const profileName: string = substringBefore(path.basename(sourcepath), ".");
    const destpath: string = outputdir
      ? `${outputdir}/${profileName}.profile-meta.xml`
      : sourcepath;

    if (x2jParser.validate(cleanXML) === true) {
      if (x2jParser.validate(profileXML) === true) {
        // parse xml to json
        const profileJSON = x2jParser.parse(profileXML, x2jOptions);
        const cleanJSON = x2jParser.parse(cleanXML, x2jOptions);

        for (const accessTypeToClean in cleanJSON.Profile) {
          const accessList = profileJSON.Profile[accessTypeToClean];
          if (Array.isArray(accessList)) {
            profileJSON.Profile[accessTypeToClean] = accessList.filter(
              (access) => {
                const cleanList = cleanJSON.Profile[accessTypeToClean];
                if (Array.isArray(cleanList)) {
                  for (const accessToClean of cleanJSON.Profile[
                    accessTypeToClean
                  ]) {
                    if (
                      profileAccessFilenamesCompare(
                        accessTypeToClean,
                        access,
                        accessToClean
                      ) === 0
                    ) {
                      return false;
                    }
                  }
                } else {
                  if (
                    profileAccessFilenamesCompare(
                      accessTypeToClean,
                      access,
                      cleanList
                    ) === 0
                  ) {
                    return false;
                  }
                }
                return true;
              }
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
    } else {
      throw `${cleansourcepath} is an invalid xml file`;
    }
  }
}
