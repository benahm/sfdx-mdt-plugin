import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";

import { updateWorkflowRuleStatus } from "../../../utils/status";

export default class Activator extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:workflow:deactivate -u {sourceOrg} -o {object} -r {rulename}
  Deactivate a workflow rule
  `,
  ];

  protected static flagsConfig = {
    objectname: flags.string({
      char: "o",
      required: true,
      description: "The salesforce object name",
    }),
    rulename: flags.string({
      char: "r",
      required: true,
      description: "The rule name",
    }),
  };

  protected static requiresUsername = true;

  public async run(): Promise<AnyJson> {
    this.ux.startSpinner(chalk.yellowBright("Activating"));

    try {
      await this.activate(this.flags.objectname, this.flags.rulename);
    } catch (e) {
      // output error
      this.ux.stopSpinner("❌");
      this.ux.error(chalk.redBright(e));
    }

    this.ux.stopSpinner("✔️");

    // Return an object to be displayed with --json
    return { success: true };
  }

  public async activate(objectname, rulename) {
    updateWorkflowRuleStatus(
      this.org.getConnection(),
      objectname,
      rulename,
      false
    );
  }
}
