import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import {
  substringBefore,
  uncapitalizeFirstLetter,
  profileAccessFilenamesCompare,
} from "../../../utils/utilities";
import { j2xOptions, x2jOptions } from "../../../config/fastXMLOptions";
export default class Composer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:compose -p {sourcepath} -d {outputdirectory}
  Compose multiple profile access files into the Profile xml file
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
    this.ux.startSpinner(chalk.yellowBright("Composing Profile"));

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
    const profileDir = await fs.readdirSync(inputdir);
    const json2xmlParser = new j2xParser(j2xOptions);
    const profileJSON = {
      Profile: {
        "@": {
          xmlns: "http://soap.sforce.com/2006/04/metadata",
        },
        applicationVisibilities: [],
      },
    };

    if (!fs.existsSync(inputdir)) {
      throw `${inputdir} does not exists`;
    }

    for (const profileAccessFileName of profileDir.sort(
      profileAccessFilenamesCompare
    )) {
      const profileAccessXMLData = await fs.readFileSync(
        inputdir + "/" + profileAccessFileName,
        {
          encoding: "utf8",
        }
      );
      if (x2jParser.validate(profileAccessXMLData) === true) {
        const profileAccessJSON = x2jParser.parse(
          profileAccessXMLData,
          x2jOptions
        );
        const accessType = uncapitalizeFirstLetter(
          substringBefore(profileAccessFileName, ".")
        );
        if (profileJSON.Profile[accessType]) {
          profileJSON.Profile[accessType].push(profileAccessJSON[accessType]);
        } else {
          profileJSON.Profile[accessType] = [profileAccessJSON[accessType]];
        }
      } else {
        throw `${
          inputdir + "/" + profileAccessFileName
        } is an invalid xml file`;
      }
    }

    // parse json to xml
    let formattedXml = json2xmlParser.parse(profileJSON);

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
