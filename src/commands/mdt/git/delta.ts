import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import { execSync, spawn } from "child_process";
import * as chalk from "chalk";
import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";

import {
  substringBeforeLast,
  substringBeforeNthChar,
  substringAfterLast,
  substringBefore,
} from "../../../utils/utilities";

import * as j2xOptions from "../../../config/j2xOptions.json";
import * as x2jOptions from "../../../config/x2jOptions.json";

const FMD_FOLDER = "force-app/main/default";

export default class Differ extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:git:diff -f {fromCommit} -t {toCommit} -d {outputdirectory}
  Generate a delta package based on a git diff
  `,
  ];

  protected static flagsConfig = {
    from: flags.string({
      char: "f",
      description: "Branch or commit from",
    }),
    to: flags.string({
      char: "t",
      default: "",
      description: "Branch or commit to",
    }),
    outputdir: flags.string({
      char: "d",
      description: "The output directory where to generate the package",
    }),
  };

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Generating delta"));
    try {
      await this.delta(this.flags.from, this.flags.to, this.flags.outputdir);
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
   * generate a delta package
   * @param from
   * @param to
   * @param outputdir
   */
  public async delta(from, to, outputdir) {
    const gitDiffList = execSync(
      `git diff --name-only ${from} ${to}`
    ).toString();
    console.log(chalk.green(gitDiffList));
    const metadataFilePathList = gitDiffList
      .split("\n")
      .filter((fileName) => fileName.startsWith(FMD_FOLDER));
    for (const metadataFilePath of metadataFilePathList) {
      await fs.mkdirSync(
        `${outputdir}/${substringBeforeLast(metadataFilePath, "/")}`,
        {
          recursive: true,
        }
      );

      const folderPath = substringBeforeLast(metadataFilePath, "/");
      const metadataFolderPath = substringBeforeNthChar(
        metadataFilePath,
        "/",
        4
      );
      switch (metadataFolderPath) {
        /** handle aura components */
        case `${FMD_FOLDER}/aura`:
          const auraFileNames = fs.readdirSync(`${folderPath}`);
          for (const auraFileName of auraFileNames) {
            await fs.copyFileSync(
              `${folderPath}/${auraFileName}`,
              `${outputdir}/${folderPath}/${auraFileName}`
            );
          }
          break;
        /** handle objects */
        case `${FMD_FOLDER}/objects`:
          const isRecordTypePatern = new RegExp(
            `${FMD_FOLDER}/objects/[^/]+/recordTypes`
          );
          // handle record types
          if (isRecordTypePatern.test(`${folderPath}`)) {
            await this.copyComplexDiffMetadata(
              from,
              `${metadataFilePath}`,
              `${outputdir}/${metadataFilePath}`,
              {
                rootTagName: "RecordType",
                requiredTagNames: ["fullName", "active", "label"],
              }
            );
          } else {
            await fs.copyFileSync(
              `${metadataFilePath}`,
              `${outputdir}/${metadataFilePath}`
            );
          }
          break;
        /** handle object translations */
        case `${FMD_FOLDER}/objectTranslations`:
          const objTraFolderName = substringAfterLast(folderPath, "/");
          await fs.copyFileSync(
            `${folderPath}/${objTraFolderName}.objectTranslation-meta.xml`,
            `${outputdir}/${folderPath}/${objTraFolderName}.objectTranslation-meta.xml`
          );
          await fs.copyFileSync(
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`
          );
          break;
        /** handle static resources */
        case `${FMD_FOLDER}/staticresources`:
          const staticResourceFolder = `${FMD_FOLDER}/staticresources`;
          if (folderPath !== staticResourceFolder) {
            const subFolderPath = folderPath.replace(
              staticResourceFolder + "/",
              ""
            );
            const resourceFolderName = substringBefore(
              subFolderPath + "/",
              "/"
            );
            await fs.copyFileSync(
              `${staticResourceFolder}/${resourceFolderName}.resource-meta.xml`,
              `${outputdir}/${staticResourceFolder}/${resourceFolderName}.resource-meta.xml`
            );
          } else {
            if (!metadataFilePath.endsWith(".resource-meta.xml")) {
              const resourceName = substringBeforeLast(
                substringAfterLast(metadataFilePath, "/"),
                "."
              );
              await fs.copyFileSync(
                `${folderPath}/${resourceName}.resource-meta.xml`,
                `${outputdir}/${folderPath}/${resourceName}.resource-meta.xml`
              );
            }
          }
          await fs.copyFileSync(
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`
          );
          break;
        /** handle custom labels */
        case `${FMD_FOLDER}/labels`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "CustomLabels", requiredTagNames: [] }
          );
          break;
        /** handle profiles */
        case `${FMD_FOLDER}/profiles`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "Profile", requiredTagNames: [] }
          );
          break;
        /** handle permission sets */
        case `${FMD_FOLDER}/permissionsets`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "PermissionSet", requiredTagNames: [] }
          );
          break;
        /** handle sharing rules */
        case `${FMD_FOLDER}/sharingRules`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "SharingRules", requiredTagNames: [] }
          );
          break;
        /** handle assignment rules */
        case `${FMD_FOLDER}/assignmentRules`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "AssignmentRules", requiredTagNames: [] }
          );
          break;
        /** handle auto response rules */
        case `${FMD_FOLDER}/autoResponseRules`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "AutoResponseRules", requiredTagNames: [] }
          );
          break;
        /** handle matching rules */
        case `${FMD_FOLDER}/matchingRules`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "MatchingRules", requiredTagNames: [] }
          );
          break;
        /** handle translations */
        case `${FMD_FOLDER}/translations`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "Translations", requiredTagNames: [] }
          );
          break;
        /** handle workflow rules */
        case `${FMD_FOLDER}/workflows`:
          await this.copyComplexDiffMetadata(
            from,
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`,
            { rootTagName: "Workflow", requiredTagNames: [] }
          );
          break;
        /** handle all other metadata */
        default:
          await fs.copyFileSync(
            `${metadataFilePath}`,
            `${outputdir}/${metadataFilePath}`
          );
          break;
      }

      /** copy meta file if exists */
      const metaFileName = `${metadataFilePath}-meta.xml`;
      if (await fs.existsSync(`${metaFileName}`)) {
        await fs.copyFileSync(
          `${metaFileName}`,
          `${outputdir}/${metaFileName}`
        );
      }
    }
  }

  /**
   * copy complex metadata diffs
   * @param commit
   * @param sourcepath
   * @param destpath
   * @param metadataInfo
   */
  public async copyComplexDiffMetadata(
    commit,
    sourcepath,
    destpath,
    metadataInfo
  ) {
    const xmlMetadata1 = await fs.readFileSync(`${sourcepath}`, {
      encoding: "utf8",
    });

    const gitShow = spawn("git", ["show", `${commit}:${sourcepath}`]);

    return new Promise((resolve, reject) => {
      let xmlMetadata2 = "";
      gitShow.stdout.on("data", (data) => {
        xmlMetadata2 += data;
      });

      gitShow.on("error", (error) => {
        reject(`error: ${error.message}`);
      });

      gitShow.on("close", async (code) => {
        const xmlDiffMetadata = this.diffMetadata(
          xmlMetadata1,
          xmlMetadata2,
          metadataInfo.rootTagName,
          metadataInfo.requiredTagNames
        );
        await fs.writeFileSync(`${destpath}`, xmlDiffMetadata, {
          encoding: "utf8",
        });
        resolve();
      });
    });
  }

  /**
   * diff metadata
   * @param xmlversion1
   * @param xmlversion2
   * @param rootTagName
   * @param requiredTagNames
   */
  public diffMetadata(xmlversion1, xmlversion2, rootTagName, requiredTagNames) {
    const json2xmlParser = new j2xParser(j2xOptions);
    const jsonVersion1 = x2jParser.parse(xmlversion1, x2jOptions);
    const jsonVersion2 = x2jParser.parse(xmlversion2, x2jOptions);

    const arrayOfVersion1 = this.metadataToJSArray(jsonVersion1, rootTagName);
    const arrayOfVersion2 = this.metadataToJSArray(jsonVersion2, rootTagName);
    const diffJSON = {};
    arrayOfVersion1.forEach((item) => {
      const jsonItem = JSON.parse(item);
      const itemTagName = jsonItem.tagName;
      const itemTagType = jsonItem.tagType;

      delete jsonItem.tagName;
      delete jsonItem.tagType;
      if (
        !arrayOfVersion2.includes(item) ||
        requiredTagNames.includes(itemTagName)
      ) {
        if (diffJSON[itemTagName]) {
          diffJSON[itemTagName].push(jsonItem);
        } else {
          if (itemTagType === "text") {
            diffJSON[itemTagName] = [jsonItem[itemTagName]];
          } else {
            diffJSON[itemTagName] = [jsonItem];
          }
        }
      }
      if (itemTagName === "@") {
        diffJSON[itemTagName] = jsonItem;
      }
    });

    // parse json to xml
    const xmlResult = json2xmlParser.parse({ [rootTagName]: diffJSON });

    return xmlResult;
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
            return JSON.stringify({
              tagName: subTagName,
              tagType: "array",
              ...el,
            });
          })
        );
      } else {
        if (typeof subNode !== "object") {
          arrayContent.push(
            JSON.stringify({
              tagName: subTagName,
              tagType: "text",
              [subTagName]: subNode,
            })
          );
        } else {
          arrayContent.push(
            JSON.stringify({
              tagName: subTagName,
              tagType: "object",
              ...subNode,
            })
          );
        }
      }
    }
    return arrayContent;
  }
}
