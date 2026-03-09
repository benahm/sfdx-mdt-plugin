import { flags, SfdxCommand } from "@salesforce/command";
import { AnyJson } from "@salesforce/ts-types";
import * as chalk from "chalk";
import * as path from "path";
import { XMLParser, XMLBuilder } from "fxp4";
import { ComponentSet } from '@salesforce/source-deploy-retrieve'

import {
  substringBefore,
  readFile,
  writeXMLFile,
} from "../../../utils/utilities";

const options = {
  ignoreDeclaration: true,
  ignoreAttributes: false,
  preserveOrder: true,
  trimValues: false,
  commentPropName: "#comment",
  suppressEmptyNode: true
};

export default class Retriever extends SfdxCommand {
  public static examples = [
    `$ sfdx mdt:translations:mergeretrieve -u {sourceOrg} -p {sourcepath} [-d {outputdirectory}]
  Retrieve all translations related to a given language and merge it to the local file
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


    const xmlParser = new XMLParser(options);
    const xmlBuilder = new XMLBuilder(options);
    const localTranslationsXMLData: string = await readFile(sourcepath);

    // read translations from local
    let localTranslationsJSON;
    try {
      localTranslationsJSON = xmlParser.parse(localTranslationsXMLData);
    } catch (err) {
      throw `${sourcepath} is an invalid xml file`;
    }

    const languageCode: string = substringBefore(
      path.basename(sourcepath),
      "."
    );
    const destpath: string = outputdir
      ? `${outputdir}/${languageCode}.translation-meta.xml`
      : sourcepath;

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

    const retrievedTranslationsXMLData: string = await readFile(sourcepath);
    // read translations from retrieved metadata
    let retrievedTranslationsJSON;
    try {
      retrievedTranslationsJSON = xmlParser.parse(retrievedTranslationsXMLData);
    } catch (err) {
      throw `${sourcepath} is an invalid xml file`;
    }

    // prepare merged translations
    let mergedTranslationsJSON = [{
      Translations: [],
      ":@": {
        "@_xmlns": "http://soap.sforce.com/2006/04/metadata"
      }
    }];

    // merge translations
    for (const transItem of localTranslationsJSON[0].Translations) {
      let name = this.extractTranslationAPIName(transItem);
      if (name) {
        const retrievedTransItem = this.findTransItemByAPIName(retrievedTranslationsJSON[0].Translations, name)
        if (retrievedTransItem) {
          mergedTranslationsJSON[0].Translations.push(retrievedTransItem);
        } else {
          mergedTranslationsJSON[0].Translations.push(transItem);
        }
      } else {
        mergedTranslationsJSON[0].Translations.push(transItem);
      }

    }

    // write xml file
    await writeXMLFile(`${destpath}`, xmlBuilder.build(mergedTranslationsJSON));
  }

  /**
   * extract the translations API Name (ex name for Custom Label & fullName for a flow definition)
   * see https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_translations.htm
   * @param transItem 
   * @returns api name for a translation
   */
  private extractTranslationAPIName(transItem) {
    const key = Object.keys(transItem)[0];
    if (key.startsWith("#")) {
      return null;
    }
    const transNodeContent = transItem[key];
    const nameNode = transNodeContent.find(item => item.hasOwnProperty("name") || item.hasOwnProperty("fullName"));
    if (!nameNode) return null
    if (nameNode.name) {
      return nameNode.name[0]['#text']
    }
    return nameNode.fullName[0]['#text']
  }

  /**
   * find the translation item by api name
   * @param tranlations 
   * @param apiName 
   * @returns 
   */
  private findTransItemByAPIName(tranlations, apiName) {
    for (const transItem of tranlations) {
      if (apiName == this.extractTranslationAPIName(transItem)) {
        return transItem
      }
    }
  }

}

