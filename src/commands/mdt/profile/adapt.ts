import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import { substringBefore, writeXMLFile } from "../../../utils/utilities";
import { filterMetadataTypeTag } from "../../../utils/adapt";
import { j2xOptions, x2jOptions } from "../../../config/fastXMLOptions";

export default class Adapter extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:adapt -p {sourcepath} -d {outputdirectory}
    Adapt a profile to be deployed to an org
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
      description:
        "The output directory where to store the profile metadata file",
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Adapting Profile"));

    try {
      await this.adapt(this.flags.sourcepath, this.flags.outputdir);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }

    this.ux.stopSpinner("✔️");

    // Return an object to be displayed with --json
    return { success: true };
  }

  public async adapt(sourcepath, outputdir) {
    const profileXMLData = await fs.readFileSync(sourcepath, {
      encoding: "utf8",
    });
    const json2xmlParser = new j2xParser(j2xOptions);
    const profileName = substringBefore(path.basename(sourcepath), ".");
    const destpath = outputdir
      ? `${outputdir}/${profileName}.profile.meta.xml`
      : sourcepath;
    let profileJSON;
    if (x2jParser.validate(profileXMLData) === true) {
      // parse xml to json
      profileJSON = x2jParser.parse(profileXMLData, x2jOptions);

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "applicationVisibilities",
        "CustomApplication",
        (profileAccess) => profileAccess["application"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "categoryGroupVisibilities",
        "DataCategoryGroup",
        (profileAccess) => profileAccess["dataCategoryGroup"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "classAccesses",
        "ApexClass",
        (profileAccess) => profileAccess["apexClass"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "customMetadataTypeAccesses",
        "CustomObject",
        (profileAccess) => profileAccess["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "customPermissions",
        "CustomPermission",
        (profileAccess) => profileAccess["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "customSettingAccesses",
        "CustomObject",
        (profileAccess) => profileAccess["name"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "externalDataSourceAccesses",
        "ExternalDataSource",
        (profileAccess) => profileAccess["externalDataSource"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "fieldPermissions",
        "CustomField",
        (profileAccess) => profileAccess["field"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "flowAccesses",
        "Flow",
        (profileAccess) => profileAccess["flow"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "layoutAssignments",
        "Layout",
        (profileAccess) => profileAccess["layout"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "layoutAssignments",
        "RecordType",
        (profileAccess) => profileAccess["recordType"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "objectPermissions",
        "CustomObject",
        (profileAccess) => profileAccess["object"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "pageAccesses",
        "ApexPage",
        (profileAccess) => profileAccess["apexPage"]
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "recordTypeVisibilities",
        "RecordType",
        (profileAccess) => profileAccess["recordType"]
      );

      // metadata api limitation
      // standard tabs are ignored because can not be listed
      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "tabVisibilities",
        "CustomTab",
        (profileAccess) => profileAccess["tab"]
      );

      await this.filterUserPermissionTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "userPermissions"
      );
    }

    // convert to xml
    const formattedXml = json2xmlParser.parse(profileJSON);

    // write xml file
    await writeXMLFile(`${destpath}`, formattedXml);
  }

  /**
   *
   * @param profile
   * @param profileAccessName
   */
  public async filterUserPermissionTag(conn, profile, profileAccessName) {
    const profileAccess = profile[profileAccessName];
    if (profileAccess) {
      const profileDescribe = await conn.sobject("Profile").describe();
      const profileAccessList = Array.isArray(profileAccess)
        ? profileAccess
        : [profileAccess];
      const userPermissionNameList = profileDescribe.fields
        .map((userPermission) => userPermission.name)
        .filter((name) => !["Id", "Name"].includes(name))
        .map((name) => name.slice(11));
      profile[profileAccessName] = profileAccessList.filter((profileAccess) =>
        userPermissionNameList.includes(profileAccess.name)
      );
      console.log(`${profileAccessName} ✔️`);
    }
  }
}
