import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as path from "path";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import {
  substringBefore,
  substringAfter,
  readFile,
  writeXMLFile,
} from "../../../utils/utilities";
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

  /**
   * adapt profile
   * @param sourcepath
   * @param outputdir
   */
  public async adapt(sourcepath: string, outputdir: string) {
    const profileXMLData: string = await readFile(sourcepath);
    const json2xmlParser = new j2xParser(j2xOptions);
    const profileName: string = substringBefore(path.basename(sourcepath), ".");
    const destpath: string = outputdir
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
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["application"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "categoryGroupVisibilities",
        "DataCategoryGroup",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["dataCategoryGroup"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "classAccesses",
        "ApexClass",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["apexClass"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "customMetadataTypeAccesses",
        "CustomObject",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "customPermissions",
        "CustomPermission",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "customSettingAccesses",
        "CustomObject",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["name"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "externalDataSourceAccesses",
        "ExternalDataSource",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["externalDataSource"])
      );

      // metadata api limitation
      // standard fields not listed in the CustomField metadata
      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "fieldPermissions",
        "CustomField",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["field"]) ||
          !substringAfter(profileAccess["field"], ",").includes("__") // don't filter standard fields
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "flowAccesses",
        "Flow",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["flow"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "layoutAssignments",
        "Layout",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["layout"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "layoutAssignments",
        "RecordType",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["recordType"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "objectPermissions",
        "CustomObject",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["object"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "pageAccesses",
        "ApexPage",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["apexPage"])
      );

      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "recordTypeVisibilities",
        "RecordType",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["recordType"])
      );

      // metadata api limitation
      // standard tabs not listed in the CustomTab metadata
      await filterMetadataTypeTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "tabVisibilities",
        "CustomTab",
        (metadataTypeList, profileAccess) =>
          metadataTypeList.includes(profileAccess["tab"]) ||
          profileAccess["tab"].startsWith("standard-") // don't filter standard tabs
      );

      await this.filterUserPermissionTag(
        this.org.getConnection(),
        profileJSON.Profile,
        "userPermissions"
      );
    }else{
      throw `${sourcepath} is an invalid xml file`;
    }

    // convert to xml
    const formattedXml = json2xmlParser.parse(profileJSON);

    // write xml file
    await writeXMLFile(`${destpath}`, formattedXml);
  }

  /**
   * filter user permission tags
   * @param conn
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
