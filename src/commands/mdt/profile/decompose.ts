import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import {
  profileAccessNameMap,
  capitalizeFirstLetter,
} from "../../../utils/utilities";
import * as j2xOptions from "../../../config/j2xOptions.json";
import * as x2jOptions from "../../../config/x2jOptions.json";

export default class Decomposer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:decompose -p {sourcepath} -d {outputdirectory}
  Hello world! This is org: MyOrg and I will be around until Tue Mar 20 2018!
  My hub org id is: 00Dxx000000001234
  `,
    `$ sfdx hello:org --name myname --targetusername myOrg@example.com
  Hello myname! This is org: MyOrg and I will be around until Tue Mar 20 2018!
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
    this.ux.startSpinner(chalk.yellowBright("Decomposing Profile"));

    try {
      await this.decompose(this.flags.sourcepath, this.flags.outputdir);
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
    let profileXMLData = await fs.readFileSync(sourcepath, {
      encoding: "utf8",
    });

    if (x2jParser.validate(profileXMLData) === true) {
      // parse xml to json
      const profileJSON = x2jParser.parse(profileXMLData, x2jOptions);
      // init the json to xml parser
      const json2xmlParser = new j2xParser(j2xOptions);
      for (const property in profileJSON.Profile) {
        const profileAccess = profileJSON.Profile[property];
        if (property !== "@") {
          if (Array.isArray(profileAccess)) {
            // check iterable
            // loop through the profile accesses
            for (const element of profileAccess) {
              const formattedXml = json2xmlParser.parse({
                [property]: element,
              });
              // write xml file
              await fs.writeFileSync(
                `${outputdir}/${capitalizeFirstLetter(
                  property
                )}.${profileAccessNameMap[property](element)}.xml`,
                formattedXml,
                {
                  encoding: "utf8",
                }
              );
            }
          } else {
            const formattedXml = json2xmlParser.parse({
              [property]: profileAccess,
            });
            // write xml file
            await fs.writeFileSync(
              `${outputdir}/${capitalizeFirstLetter(
                property
              )}.${profileAccessNameMap[property](profileAccess)}.xml`,
              formattedXml,
              {
                encoding: "utf8",
              }
            );
          }
        }
      }
    } else {
      throw `${sourcepath} is an invalid xml file`;
    }
  }
}
