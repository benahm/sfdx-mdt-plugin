import { spawn, execSync } from "child_process";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";
import { j2xOptions, x2jOptions } from "../config/fastXMLOptions";

import { readFile, writeXMLFile } from "./utilities";

/**
 * metadata to JS Array
 * @param jsonContent
 * @param rootTagName
 */
const metadataToJSArray = (jsonContent, rootTagName) => {
  let arrayContent = [];
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
 */
const diffChangesInMetadata = (
  xmlVersion1,
  xmlVersion2,
  rootTagName,
  compareFunction
) => {
  const json2xmlParser = new j2xParser(j2xOptions);
  const jsonVersion1 = x2jParser.parse(`${xmlVersion1}`, x2jOptions);
  const jsonVersion2 = x2jParser.parse(`${xmlVersion2}`, x2jOptions);
  const arrayOfVersion1 = metadataToJSArray(jsonVersion1, rootTagName);
  const arrayOfVersion2 = metadataToJSArray(jsonVersion2, rootTagName);

  const diffJSON = {};
  for (const item of arrayOfVersion1) {
    const jsonItem = JSON.parse(item);
    const itemTagName = jsonItem.tagName;
    const itemTagType = jsonItem.tagType;

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
    }
    if (itemTagName === "@") {
      diffJSON[itemTagName] = jsonItem;
    }
  }
  const xmlDiffMetadata = json2xmlParser.parse({ [rootTagName]: diffJSON });
  return xmlDiffMetadata;
};

/**
 * git show a file version related to a given commit
 * @param commit
 * @param sourcepath
 */
const gitShow = async (commit, sourcepath) => {
  const gitShow = spawn("git", ["show", `${commit}:${sourcepath}`]);
  return new Promise((resolve, reject) => {
    let fileContent = "";

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
const gitDiff = async (from, to) => {
  const coreQuotePath = await execSync(`git config core.quotePath`);
  await execSync(`git config core.quotePath false`);
  console.log("to", to);
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
      await execSync(`git config core.quotePath ${coreQuotePath}`);
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
  from,
  to,
  sourcepath,
  metadataInfo,
  packageDir,
  destructiveDir?
) => {
  const xmlMetadata1 = await gitShow(from, sourcepath);
  let xmlMetadata2;
  if (to) {
    xmlMetadata2 = await gitShow(to, sourcepath);
  } else {
    xmlMetadata2 = await readFile(`${sourcepath}`);
  }

  const xmlDiffMetadata = diffChangesInMetadata(
    xmlMetadata2,
    xmlMetadata1,
    metadataInfo.rootTagName,
    (array, item, itemTagName) =>
      !array.includes(item) ||
      metadataInfo.requiredTagNames.includes(itemTagName)
  );

  await writeXMLFile(`${packageDir}/${sourcepath}`, xmlDiffMetadata);

  if (destructiveDir) {
    const xmlDeletedMetadata = diffChangesInMetadata(
      xmlMetadata1,
      xmlMetadata2,
      metadataInfo.rootTagName,
      (array, item, itemTagName) =>
        (!array.includes(item) &&
          array.filter(
            (el) => JSON.parse(el).fullName === JSON.parse(item).fullName
          ).length === 0) ||
        metadataInfo.requiredTagNames.includes(itemTagName)
    );
    await writeXMLFile(`${destructiveDir}/${sourcepath}`, xmlDeletedMetadata);
  }
};

export {
  metadataToJSArray,
  diffChangesInMetadata,
  gitShow,
  gitDiff,
  copyDiffOfComplexMetadata,
};
