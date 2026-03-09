import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as fs from "fs";
import * as chalk from "chalk";
import * as path from "path";
import { j2xParser } from "fast-xml-parser";

import { substringBefore, writeXMLFile } from "../../../utils/utilities";

import { j2xOptions } from "../../../config/fastXMLOptions";

export default class Retriever extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:retrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
  Retrieve a profile with all the accesses
  `,
  ];

  protected static flagsConfig = {
    sourcepath: flags.string({
      char: "p",
      required: true,
      description:
        "The path to the source metadata profile file or folder of profiles",
    }),
    outputdir: flags.string({
      char: "d",
      description:
        "The output directory where to store the profile metadata file",
    }),
  };

  protected static requiresUsername = true;

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

  public async retrieve(sourcepath: string, outputdir: string) {
    const json2xmlParser = new j2xParser(j2xOptions);
    const conn = this.org.getConnection();
    let profileNames = [];
    let sourcedirpath;
    if (fs.lstatSync(sourcepath).isDirectory()) {
      // directory
      profileNames = fs
        .readdirSync(sourcepath)
        .map((name) => substringBefore(name, "."));
      sourcedirpath = sourcepath;
    } else {
      // file
      const profileName: string = substringBefore(
        path.basename(sourcepath),
        "."
      );
      profileNames.push(profileName);
      sourcedirpath = path.dirname(sourcepath);
    }

    for (const profileName of profileNames) {
      const destpath: string = outputdir
        ? `${outputdir}/${profileName}.profile-meta.xml`
        : `${sourcedirpath}/${profileName}.profile-meta.xml`;

      // read profile from org
      const profileJSON = await conn.metadata.readSync("Profile", [
        profileName,
      ]);

      const formattedXml: string = json2xmlParser.parse({
        Profile: {
          "@": {
            xmlns: "http://soap.sforce.com/2006/04/metadata",
          },
          ...profileJSON,
        },
      });

      // write xml file
      await writeXMLFile(`${destpath}`, formattedXml);
      console.log(`"${profileName}" retrieved ✔️`);
    }
  }
}
