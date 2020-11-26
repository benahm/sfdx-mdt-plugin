import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import { substringBefore } from "../../../utils/utilities";
import * as j2xOptions from "../../../config/j2xOptions.json";
import * as x2jOptions from "../../../config/x2jOptions.json";

export default class Decomposer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:adapt -p {sourcepath} -d {outputdirectory}
    Adapt a profile to be deployed to an org
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

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "applicationVisibilities",
        "CustomApplication",
        (profileAccess) => profileAccess["application"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "categoryGroupVisibilities",
        "DataCategoryGroup",
        (profileAccess) => profileAccess["dataCategoryGroup"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "classAccesses",
        "ApexClass",
        (profileAccess) => profileAccess["apexClass"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "customMetadataTypeAccesses",
        "CustomObject",
        (profileAccess) => profileAccess["name"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "customPermissions",
        "CustomPermission",
        (profileAccess) => profileAccess["name"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "customSettingAccesses",
        "CustomObject",
        (profileAccess) => profileAccess["name"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "externalDataSourceAccesses",
        "ExternalDataSource",
        (profileAccess) => profileAccess["externalDataSource"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "fieldPermissions",
        "CustomField",
        (profileAccess) => profileAccess["field"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "flowAccesses",
        "Flow",
        (profileAccess) => profileAccess["flow"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "layoutAssignments",
        "Layout",
        (profileAccess) => profileAccess["layout"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "layoutAssignments",
        "RecordType",
        (profileAccess) => profileAccess["recordType"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "objectPermissions",
        "CustomObject",
        (profileAccess) => profileAccess["object"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "pageAccesses",
        "ApexPage",
        (profileAccess) => profileAccess["apexPage"]
      );

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "recordTypeVisibilities",
        "RecordType",
        (profileAccess) => profileAccess["recordType"]
      );

      // metadata api limitation
      // standard tab are ignored because can not be listed
      await this.filterProfileAccesses(
        profileJSON.Profile,
        "tabVisibilities",
        "CustomTab",
        (profileAccess) => profileAccess["tab"]
      );

      await this.filterUserPermissionAccesses(
        profileJSON.Profile,
        "userPermissions"
      );
    }

    // convert to xml
    const formattedXml = json2xmlParser.parse(profileJSON);

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

  /**
   *
   * @param profileJSON
   * @param profileAccessName
   * @param metadataType
   */
  public async filterProfileAccesses(
    profile,
    profileAccessName,
    metadataType,
    getProfileAccessName
  ) {
    const profileAccess = profile[profileAccessName];
    if (profileAccess) {
      const metadataTypeFullNames = await this.listMetadataTypeFullNames(
        metadataType
      );
      const profileAccessList = Array.isArray(profileAccess)
        ? profileAccess
        : [profileAccess];

      profile[profileAccessName] = profileAccessList.filter((profileAccess) =>
        metadataTypeFullNames.includes(getProfileAccessName(profileAccess))
      );
      console.log(`${profileAccessName} ✔️`);
    }
  }

  /**
   *
   * @param profile
   * @param profileAccessName
   */
  public async filterUserPermissionAccesses(profile, profileAccessName) {
    const profileAccess = profile[profileAccessName];
    if (profileAccess) {
      const conn = this.org.getConnection();
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

  /**
   * list metadata type full names
   * @param metadataTypeName
   * @param folderName
   */
  public async listMetadataTypeFullNames(metadataTypeName, folderName?) {
    const conn = this.org.getConnection();
    const listMetadataQuery = folderName
      ? { type: metadataTypeName, folder: folderName }
      : { type: metadataTypeName };
    const metadataList = await conn.metadata.list([listMetadataQuery]);

    const metadataFullNameList = metadataList.map(
      (metadata) => metadata.fullName
    );
    return metadataFullNameList;
  }
}
