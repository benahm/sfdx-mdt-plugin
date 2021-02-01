import { spawn, execSync } from "child_process";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";
import { j2xOptions, x2jOptions } from "../config/fastXMLOptions";

import {
  readFile,
  writeXMLFile,
  mkdirRecursive,
  substringBeforeLast,
} from "./utilities";

/**
 * metadata to JS Array
 * @param jsonContent
 * @param rootTagName
 */
const metadataToJSArray = (jsonContent, rootTagName: string): string[] => {
  let arrayContent: string[] = [];
  for (const subTagName in jsonContent[rootTagName]) {
    const subNode = jsonContent[rootTagName][subTagName];

    if (Array.isArray(subNode)) {
      // check if array of one
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
};

/**
 * diff metadata
 * @param xmlversion1
 * @param xmlversion2
 * @param rootTagName
 * @param requiredTagNames
 * @param compareFunction
 */
const diffChangesInMetadata = (
  xmlVersion1: string,
  xmlVersion2: string,
  rootTagName: string,
  requiredTagNames: string[],
  compareFunction: (
    array: string[],
    item: string,
    itemTagName: string
  ) => boolean
): string => {
  const json2xmlParser = new j2xParser(j2xOptions);
  const jsonVersion1 = x2jParser.parse(`${xmlVersion1}`, x2jOptions);
  const jsonVersion2 = x2jParser.parse(`${xmlVersion2}`, x2jOptions);
  const arrayOfVersion1 = metadataToJSArray(jsonVersion1, rootTagName);
  const arrayOfVersion2 = metadataToJSArray(jsonVersion2, rootTagName);

  const diffJSON = {};
  let noDiffFound = true;
  for (const item of arrayOfVersion1) {
    const jsonItem = JSON.parse(item);
    const itemTagName: string = jsonItem.tagName;
    const itemTagType: string = jsonItem.tagType;

    delete jsonItem.tagName;
    delete jsonItem.tagType;
    if (compareFunction(arrayOfVersion2, item, itemTagName)) {
      if (diffJSON[itemTagName]) {
        diffJSON[itemTagName].push(jsonItem);
      } else {
        if (itemTagType === "text") {
          diffJSON[itemTagName] = [jsonItem[itemTagName]];
        } else {
          diffJSON[itemTagName] = [jsonItem];
        }
      }
      if (!requiredTagNames.includes(itemTagName)) {
        noDiffFound = false;
      }
    }
    if (itemTagName === "@") {
      diffJSON[itemTagName] = jsonItem;
    }
  }
  // no diff (only the @ property & requiredTagNames)
  if (noDiffFound) {
    return "";
  }
  const xmlDiffMetadata: string = json2xmlParser.parse({
    [rootTagName]: diffJSON,
  });
  return xmlDiffMetadata;
};

/**
 * git show a file version related to a given commit
 * @param commit
 * @param sourcepath
 */
const gitShow = async (commit: string, sourcepath: string): Promise<string> => {
  const gitShow = spawn("git", ["show", `${commit}:${sourcepath}`]);
  return new Promise((resolve, reject) => {
    let fileContent: string = "";

    gitShow.stdout.on("data", (data) => {
      fileContent += data;
    });

    gitShow.on("error", (error) => {
      reject(`error: ${error.message}`);
    });

    gitShow.on("close", async (code) => {
      resolve(fileContent);
    });
  });
};

/**
 * git diff
 * @param from
 * @param to
 */
const gitDiff = async (from: string, to: string): Promise<string> => {
  let coreQuotePath;
  try {
    coreQuotePath = await execSync(
      `git config --get core.quotePath`
    ).toString();
  } catch (e) {
    // ignore if error
  }
  await execSync(`git config core.quotePath false`);
  const diffArgs = to
    ? ["diff", "--name-status", from, to]
    : ["diff", "--name-status", from];
  const gitDiff = spawn("git", diffArgs);
  return new Promise(async (resolve, reject) => {
    let output: string = "";

    gitDiff.stdout.on("data", (data) => {
      output += data;
    });

    gitDiff.on("error", (error) => {
      reject(`error: ${error.message}`);
    });

    gitDiff.on("close", async (code) => {
      if (coreQuotePath) {
        await execSync(`git config core.quotePath ${coreQuotePath}`);
      } else {
        await execSync(`git config --unset core.quotePath`);
      }
      resolve(output);
    });
  });
};

/**
 * copy complex metadata diffs
 * @param from
 * @param to
 * @param sourcepath
 * @param metadataInfo
 * @param packageDir
 * @param destructiveDir
 */
const copyDiffOfComplexMetadata = async (
  from: string,
  to: string,
  sourcepath: string,
  metadataInfo: { rootTagName: string; requiredTagNames: string[] },
  packageDir: string,
  destructiveDir?: string
) => {
  const xmlMetadata1: string = await gitShow(from, sourcepath);
  let xmlMetadata2: string;
  if (to) {
    xmlMetadata2 = await gitShow(to, sourcepath);
  } else {
    xmlMetadata2 = await readFile(`${sourcepath}`);
  }

  const xmlDiffMetadata = diffChangesInMetadata(
    xmlMetadata2,
    xmlMetadata1,
    metadataInfo.rootTagName,
    metadataInfo.requiredTagNames,
    (array, item, itemTagName) =>
      !array.includes(item) ||
      metadataInfo.requiredTagNames.includes(itemTagName)
  );

  if (xmlDiffMetadata) {
    await writeXMLFile(`${packageDir}/${sourcepath}`, xmlDiffMetadata);
  }

  if (destructiveDir) {
    const xmlDeletedMetadata = diffChangesInMetadata(
      xmlMetadata1,
      xmlMetadata2,
      metadataInfo.rootTagName,
      metadataInfo.requiredTagNames,
      (array, item, itemTagName) =>
        (!array.includes(item) &&
          array.filter(
            (el) => JSON.parse(el).fullName === JSON.parse(item).fullName
          ).length === 0) ||
        metadataInfo.requiredTagNames.includes(itemTagName)
    );
    if (xmlDeletedMetadata) {
      await mkdirRecursive(
        `${destructiveDir}/${substringBeforeLast(sourcepath, "/")}`
      );
      await writeXMLFile(`${destructiveDir}/${sourcepath}`, xmlDeletedMetadata);
    }
  }
};

export {
  metadataToJSArray,
  diffChangesInMetadata,
  gitShow,
  gitDiff,
  copyDiffOfComplexMetadata,
};
