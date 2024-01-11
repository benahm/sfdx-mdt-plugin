import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as fs from "fs";

import {
  substringBeforeLast,
  substringBeforeNthChar,
  substringAfterLast,
  substringBefore,
  mkdirRecursive,
  writeFile,
  copyFile,
  copyFolderRecursive,
  rmRecursive,
} from "../../../utils/utilities";
import {
  gitShow,
  gitDiff,
  copyDiffOfComplexMetadata,
} from "../../../utils/delta";

const FMD_FOLDER = ["force-app/main/default"];

export default class Differ extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:git:diff -f {fromCommit} [-t {toCommit}] -p {packagedirectory} [-d destructivedirectory] [-a {additionalDirectories}]
  Generate a delta package based on a git diff
  `,
  ];

  protected static flagsConfig = {
    from: flags.string({
      char: "f",
      required: true,
      description: "Branch or commit from",
    }),
    to: flags.string({
      char: "t",
      default: "",
      description: "Branch or commit to",
    }),
    packagedir: flags.string({
      char: "p",
      required: true,
      description: "The output directory where to generate the package",
    }),
    descructivedir: flags.string({
      char: "d",
      description:
        "The output directory where to generate the destructive package",
    }),
    additionaldir: flags.string({
        char: "a",
        description:
            "Comma separated list of additional directories to scan",
    }),
  };

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Generating delta"));
    try {
      await this.delta(
        this.flags.from,
        this.flags.to,
        this.flags.packagedir,
        this.flags.descructivedir,
        this.flags.additionaldir
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

  /**
   * generate a delta package
   * @param from
   * @param to
   * @param packagedir
   * @param destructivedir
   * @param additionaldir
   */
  public async delta(
    from: string,
    to: string,
    packagedir: string,
    destructivedir: string,
    additionaldir: string
  ) {
    if (additionaldir){
        additionaldir.split(/,/).forEach((val) => {
            FMD_FOLDER.push(val.trim());
        });
    }
    const gitDiffList: string = await gitDiff(from, to);
    const { changedMetadataFilePathList, deletedMetadataFilePathList } =
      this.generateDiffLists(gitDiffList);

    if (destructivedir) {
      for (const metadataFilePath of deletedMetadataFilePathList) {
        await mkdirRecursive(
          `${destructivedir}/${substringBeforeLast(metadataFilePath, "/")}`
        );
        const fileContent: string = await gitShow(from, metadataFilePath);
        await writeFile(`${destructivedir}/${metadataFilePath}`, fileContent);
      }
    }
    for (const metadataFilePath of changedMetadataFilePathList) {
      await mkdirRecursive(
        `${packagedir}/${substringBeforeLast(metadataFilePath, "/")}`
      );

      const folderPath: string = substringBeforeLast(metadataFilePath, "/");
      const metadataFolderPath: string = substringBeforeNthChar(
        metadataFilePath,
        "/",
        4
      );
      switch (metadataFolderPath) {
        /** handle aura components */
        case `${FMD_FOLDER}/aura`:
          const auraFileNames = fs.readdirSync(`${folderPath}`);
          for (const auraFileName of auraFileNames) {
            await copyFile(
              `${folderPath}/${auraFileName}`,
              `${packagedir}/${folderPath}/${auraFileName}`
            );
          }
          break;
        /** handle lwc components */
        case `${FMD_FOLDER}/lwc`:
          if (folderPath !== `${FMD_FOLDER}/lwc`) {
            let metadataTypeFolderPath: string = substringBeforeNthChar(
              metadataFilePath,
              "/",
              5
            );
            copyFolderRecursive(metadataTypeFolderPath,`${packagedir}/${metadataTypeFolderPath}`)
            rmRecursive(`${packagedir}/${metadataTypeFolderPath}/__tests__`) // __tests__ ignored
          }
          break;
        /** handle experience bundles */
        case `${FMD_FOLDER}/experiences`:
          let metadataTypeFolderPath: string = substringBeforeNthChar(
            metadataFilePath,
            "/",
            5
          );
          if (fs.lstatSync(metadataTypeFolderPath).isFile()) {
            metadataTypeFolderPath = substringBefore(metadataFilePath, ".");
          }
          await copyFile(
            `${metadataTypeFolderPath}.site-meta.xml`,
            `${packagedir}/${metadataTypeFolderPath}.site-meta.xml`
          );
          const expDirNames = fs.readdirSync(`${metadataTypeFolderPath}`);
          for (const expDirName of expDirNames) {
            const expFileNames = fs.readdirSync(
              `${metadataTypeFolderPath}/${expDirName}`
            );
            for (const expFileName of expFileNames) {
              await mkdirRecursive(
                `${packagedir}/${metadataTypeFolderPath}/${expDirName}`
              );
              await copyFile(
                `${metadataTypeFolderPath}/${expDirName}/${expFileName}`,
                `${packagedir}/${metadataTypeFolderPath}/${expDirName}/${expFileName}`
              );
            }
          }
          break;
        /** handle objects */
        case `${FMD_FOLDER}/objects`:
          const isRecordTypePatern = new RegExp(
            `${FMD_FOLDER}/objects/[^/]+/recordTypes`
          );
          // handle record types
          if (isRecordTypePatern.test(`${folderPath}`)) {
            await copyDiffOfComplexMetadata(
              from,
              to,
              `${metadataFilePath}`,
              {
                rootTagName: "RecordType",
                requiredTagNames: [
                  "fullName",
                  "active",
                  "label",
                  "businessProcess",
                ],
              },
              `${packagedir}`
            );
          } else {
            await copyFile(
              `${metadataFilePath}`,
              `${packagedir}/${metadataFilePath}`
            );
          }
          break;
        /** handle object translations */
        case `${FMD_FOLDER}/objectTranslations`:
          const objTraFolderName = substringAfterLast(folderPath, "/");
          await copyFile(
            `${folderPath}/${objTraFolderName}.objectTranslation-meta.xml`,
            `${packagedir}/${folderPath}/${objTraFolderName}.objectTranslation-meta.xml`
          );
          await copyFile(
            `${metadataFilePath}`,
            `${packagedir}/${metadataFilePath}`
          );
          break;
        /** handle static resources */
        case `${FMD_FOLDER}/staticresources`:
          const staticResourceFolder = `${FMD_FOLDER}/staticresources`;
          if (folderPath !== staticResourceFolder) {
            // static resource of type folder
            const subFolderPath = folderPath.replace(
              staticResourceFolder + "/",
              ""
            );
            const resourceFolderName = substringBefore(
              subFolderPath + "/",
              "/"
            );
            await copyFile(
              `${staticResourceFolder}/${resourceFolderName}.resource-meta.xml`,
              `${packagedir}/${staticResourceFolder}/${resourceFolderName}.resource-meta.xml`
            );
            await copyFolderRecursive(
              `${staticResourceFolder}/${resourceFolderName}`,
              `${packagedir}/${staticResourceFolder}/${resourceFolderName}`
            );
          } else {
            // static resource of type file
            if (!metadataFilePath.endsWith(".resource-meta.xml")) {
              const resourceName = substringBeforeLast(
                substringAfterLast(metadataFilePath, "/"),
                "."
              );
              await copyFile(
                `${folderPath}/${resourceName}.resource-meta.xml`,
                `${packagedir}/${folderPath}/${resourceName}.resource-meta.xml`
              );
            }
            await copyFile(
              `${metadataFilePath}`,
              `${packagedir}/${metadataFilePath}`
            );
          }
          break;
        /** handle custom labels */
        case `${FMD_FOLDER}/labels`:
          await copyDiffOfComplexMetadata(
            from,
            to,
            `${metadataFilePath}`,
            { rootTagName: "CustomLabels", requiredTagNames: [] },
            `${packagedir}`,
            destructivedir
          );
          break;
        /** handle profiles */
        case `${FMD_FOLDER}/profiles`:
          await copyDiffOfComplexMetadata(
            from,
            to,
            `${metadataFilePath}`,
            { rootTagName: "Profile", requiredTagNames: [] },
            `${packagedir}`
          );
          break;
        /** handle sharing rules */
        case `${FMD_FOLDER}/sharingRules`:
          await copyDiffOfComplexMetadata(
            from,
            to,
            `${metadataFilePath}`,
            { rootTagName: "SharingRules", requiredTagNames: [] },
            `${packagedir}`,
            destructivedir
          );
          break;
        /** handle assignment rules */
        case `${FMD_FOLDER}/assignmentRules`:
          await copyDiffOfComplexMetadata(
            from,
            to,
            `${metadataFilePath}`,
            { rootTagName: "AssignmentRules", requiredTagNames: [] },
            `${packagedir}`,
            destructivedir
          );
          break;
        /** handle auto response rules */
        case `${FMD_FOLDER}/autoResponseRules`:
          await copyDiffOfComplexMetadata(
            from,
            to,
            `${metadataFilePath}`,
            { rootTagName: "AutoResponseRules", requiredTagNames: [] },
            `${packagedir}`,
            destructivedir
          );
          break;
        /** handle matching rules */
        case `${FMD_FOLDER}/matchingRules`:
          await copyDiffOfComplexMetadata(
            from,
            to,
            `${metadataFilePath}`,
            { rootTagName: "MatchingRules", requiredTagNames: [] },
            `${packagedir}`,
            destructivedir
          );
          break;
        /** handle translations */
        case `${FMD_FOLDER}/translations`:
          await copyDiffOfComplexMetadata(
            from,
            to,
            `${metadataFilePath}`,
            { rootTagName: "Translations", requiredTagNames: [] },
            `${packagedir}`
          );
          break;
        /** handle workflow rules */
        case `${FMD_FOLDER}/workflows`:
          await copyDiffOfComplexMetadata(
            from,
            to,
            `${metadataFilePath}`,
            { rootTagName: "Workflow", requiredTagNames: [] },
            `${packagedir}`,
            destructivedir
          );
          break;
        /** handle all other metadata */
        default:
          await copyFile(
            `${metadataFilePath}`,
            `${packagedir}/${metadataFilePath}`
          );
          break;
      }

      /** copy meta file if exists */
      const metaFileName = `${metadataFilePath}-meta.xml`;
      if (fs.existsSync(`${metaFileName}`)) {
        await copyFile(`${metaFileName}`, `${packagedir}/${metaFileName}`);
      }

      /** copy non meta file if only meta file was modified */
      if (metadataFilePath.endsWith("-meta.xml")) {
        const metaXMLIndex = metadataFilePath.indexOf("-meta.xml");
        const metadataFile = metadataFilePath.substring(0, metaXMLIndex);
        if (fs.existsSync(`${metadataFile}`)) {
          await copyFile(`${metadataFile}`, `${packagedir}/${metadataFile}`);
        }
      }
    }
  }

  /**
   * generate diff lists
   * @param gitDiffList
   */
  private generateDiffLists(gitDiffList: string) {
    const changedMetadataFilePathList: string[] = [];
    const deletedMetadataFilePathList: string[] = [];
    gitDiffList.split("\n").forEach((diffFileLine) => {
      const diffFileParts: string[] = diffFileLine.split(/\t/);
      FMD_FOLDER.forEach((FOLDER)=>{
          if (diffFileParts.length > 1 && diffFileParts[1].startsWith(FOLDER)) {
            switch (diffFileParts[0].charAt(0)) {
              case "D":
                console.log(
                  chalk.green(diffFileParts[1]) + " " + chalk.redBright("DELETED")
                );
                deletedMetadataFilePathList.push(diffFileParts[1]);
                break;
              case "R":
                console.log(
                  chalk.green(diffFileParts[1]) +
                    " " +
                    chalk.whiteBright("RENAMED TO") +
                    " " +
                    chalk.green(diffFileParts[2])
                );
                deletedMetadataFilePathList.push(diffFileParts[1]);
                changedMetadataFilePathList.push(diffFileParts[2]);
                break;
              default:
                console.log(
                  chalk.green(diffFileParts[1]) +
                    " " +
                    chalk.yellowBright("MODIFIED")
                );
                changedMetadataFilePathList.push(diffFileParts[1]);
                break;
            }
          }
      });
    });
    return { changedMetadataFilePathList, deletedMetadataFilePathList };
  }
}
