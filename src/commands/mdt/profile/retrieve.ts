import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import { j2xParser } from "fast-xml-parser";

import { substringBefore } from "../../../utils/utilities";

import * as j2xOptions from "../../../config/j2xOptions.json";

export default class Composer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:compose -p {sourcepath} -d {outputdirectory}
  Compose multiple profile access files into the Profile xml file
  `,
  ];

  protected static requiresUsername = true;

  protected static flagsConfig = {
    sourcepath: flags.string({
      char: "p",
      description: "The path to the source metadata file",
    }),
    outputdir: flags.string({
      char: "d",
      description:
        "The input directory that stores the decomposed metadata files",
    }),
  };

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Retrieving Profile"));

    try {
      await this.retrieve(this.flags.sourcepath, this.flags.outputdir);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }

    this.ux.stopSpinner("✔️");

    // Return an object to be displayed with --json
    return { success: true };
  }

  public async retrieve(sourcepath, outputdir) {
    const json2xmlParser = new j2xParser(j2xOptions);
    const conn = this.org.getConnection();
    const profileName = substringBefore(path.basename(sourcepath), ".");
    const destpath = outputdir
      ? `${outputdir}/${profileName}.profile.meta.xml`
      : sourcepath;

    // read profile from org
    var profileJSON = await conn.metadata.readSync("Profile", [profileName]);

    let formattedXml = json2xmlParser.parse({
      Profile: {
        "@": {
          xmlns: "http://soap.sforce.com/2006/04/metadata",
        },
        ...profileJSON,
      },
    });

    // write xml version & encoding
    await fs.writeFileSync(
      `${destpath}`,
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      {
        encoding: "utf8",
      }
    );

    // write xml file
    await fs.writeFileSync(`${destpath}`, formattedXml, {
      encoding: "utf8",
      flag: "a",
    });
  }
}
