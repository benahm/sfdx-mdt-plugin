import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import { ComponentSet } from '@salesforce/source-deploy-retrieve'

export default class Retriever extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:translations:retrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
  Retrieve all translations related to a given language
  `,
  ];

  protected static flagsConfig = {
    sourcepath: flags.string({
      char: "p",
      required: true,
      description: "The path to the source metadata translation file",
    }),
    outputdir: flags.string({
      char: "d",
      description:
        "The output directory where to store the translations metadata file",
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Retrieving Translations"));

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
    const conn = this.org.getConnection();
    // retrieve the metadata
    const retrieve = await ComponentSet
      .fromSource(sourcepath)
      .retrieve({
        // @ts-ignore
        usernameOrConnection: conn,
        // default location if retrieved component doesn't match with one in set
        output: './',
        merge: true
      });
    retrieve.onUpdate(({ status }) => console.log(`Status: ${status}`));
    // Wait for polling to finish and get the RetrieveResult object
    await retrieve.pollStatus();

  }
}
