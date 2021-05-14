import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as AdmZip from "adm-zip";
import * as chalk from "chalk";

const DEST_FOLDER = ".";

export default class Retriever extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:profile:retrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
  Retrieve a profile with all the accesses
  `,
  ];

  protected static flagsConfig = {
    changesetname: flags.string({
      char: "n",
      required: true,
      description: "The change set name",
    }),
    outputdir: flags.string({
      char: "d",
      default: "force-app",
      description:
        "The output directory where to store the profile metadata file",
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Retrieving Change Set"));

    try {
      await this.retrieve(
        this.flags.changesetname,
        this.flags.targetusername,
        this.flags.outputdir
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

  public async retrieve(
    changesetname: string,
    targetusername: string,
    outputdir: string
  ) {
    const sourceOrgParam = targetusername ? `-u ${targetusername}` : "";
    await execSync(
      `sfdx force:mdapi:retrieve -p "${changesetname}" ${sourceOrgParam} -r ${DEST_FOLDER}`
    );
    const zip = new AdmZip(DEST_FOLDER + "/unpackaged.zip");
    zip.extractAllTo(DEST_FOLDER, true);
    await fs.unlinkSync(DEST_FOLDER + "/unpackaged.zip");

    await this.listDirectory(DEST_FOLDER + "/" + changesetname);
  }

  /**
   * list files
   * @param dir
   */
  public listDirectory(dir: string) {
    return new Promise(async (resolve) => {
      await fs.readdirSync(dir).forEach(async (f) => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
          await this.listDirectory(dirPath);
        } else {
          console.log(path.relative(DEST_FOLDER, path.join(dir, f)));
          resolve(0);
        }
      });
    });
  }
}
