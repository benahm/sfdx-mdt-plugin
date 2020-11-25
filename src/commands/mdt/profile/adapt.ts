import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";
import * as path from "path";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import {
  profileAccessNameMap,
  substringBefore,
} from "../../../utils/utilities";
import * as j2xOptions from "../../../config/j2xOptions.json";
import * as x2jOptions from "../../../config/x2jOptions.json";

export default class Decomposer extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:decompose -p {sourcepath} -d {outputdirectory}
    Decompose Profile xml file to multiple profile access files
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

      await this.filterProfileAccesses(
        profileJSON.Profile,
        "tabVisibilities",
        "CustomTab",
        (profileAccess) => profileAccess["tab"]
      );

      // var profileJSON = await conn.sobject("Profile").describe()
      // await this.filterProfileAccesses(
      //   profileJSON,
      //   "userPermissions",
      //   "userPermissions"
      // );
    }

    // console.log(result);
    let formattedXml = json2xmlParser.parse(profileJSON);

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
    }
  }

  public async listMetadataTypeFullNames(metadataTypeName, folderName?) {
    const conn = this.org.getConnection();
    const listMetadataQuery = folderName
      ? { type: metadataTypeName, folder: folderName }
      : { type: metadataTypeName };
    const metadataList = await conn.metadata.list([listMetadataQuery]);
    console.log("metadataList", metadataTypeName, listMetadataQuery);
    const metadataFullNameList = metadataList.map(
      (metadata) => metadata.fullName
    );
    return metadataFullNameList;
  }

  /**
   * metadata to JS Array
   * @param jsonContent
   * @param rootTagName
   */
  public metadataToJSArray(jsonContent, rootTagName) {
    let arrayContent = [];
    for (const subTagName in jsonContent[rootTagName]) {
      const subNode = jsonContent[rootTagName][subTagName];
      if (Array.isArray(subNode)) {
        arrayContent = arrayContent.concat(
          jsonContent[rootTagName][subTagName].map((el) => {
            return JSON.stringify(
              {
                tagName: subTagName,
                tagType: "array",
                ...el,
              },
              stringifyReplacer
            );
          })
        );
      } else {
        if (typeof subNode !== "object") {
          arrayContent.push(
            JSON.stringify(
              {
                tagName: subTagName,
                tagType: "text",
                [subTagName]: subNode,
              },
              stringifyReplacer
            )
          );
        } else {
          arrayContent.push(
            JSON.stringify(
              {
                tagName: subTagName,
                tagType: "object",
                ...subNode,
              },
              stringifyReplacer
            )
          );
        }
      }
    }
    return arrayContent;
  }
}

const stringifyReplacer = (k, v) =>
  v === true ? "true" : v === false ? "false" : v;
