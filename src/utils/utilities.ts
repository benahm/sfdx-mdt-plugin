import * as fs from "fs";
import * as path from "path";

/**
 * compare profile access file names
 * @param accessType
 * @param access1
 * @param access2
 */
const profileAccessFilenamesCompare = (
  accessType: string,
  access1,
  access2
) => {
  switch (accessType) {
    case "applicationVisibilities":
      if (access1["application"] === access2["application"]) return 0;
      return access1["application"] > access2["application"] ? 1 : -1;
    case "categoryGroupVisibilities":
      if (access1["dataCategoryGroup"] === access2["dataCategoryGroup"])
        return 0;
      return access1["dataCategoryGroup"] > access2["dataCategoryGroup"]
        ? 1
        : -1;
    case "customMetadataTypeAccesses":
      if (access1["name"] === access2["name"]) return 0;
      return access1["name"] > access2["name"] ? 1 : -1;
    case "classAccesses":
      if (access1["apexClass"] === access2["apexClass"]) return 0;
      return access1["apexClass"] > access2["apexClass"] ? 1 : -1;
    case "customPermissions":
      if (access1["name"] === access2["name"]) return 0;
      return access1["name"] > access2["name"] ? 1 : -1;
    case "customSettingAccesses":
      if (access1["name"] === access2["name"]) return 0;
      return access1["name"] > access2["name"] ? 1 : -1;
    case "externalDataSourceAccess":
      if (access1["externalDataSource"] === access2["externalDataSource"])
        return 0;
      return access1["externalDataSource"] > access2["externalDataSource"]
        ? 1
        : -1;
    case "fieldPermissions":
      if (access1["field"] === access2["field"]) return 0;
      return access1["field"] > access2["field"] ? 1 : -1;
    case "flowAccesses":
      if (access1["flow"] === access2["flow"]) return 0;
      return access1["flow"] > access2["flow"] ? 1 : -1;
    case "layoutAssignments":
      const layoutName1 = access1["layout"];
      const layoutName2 = access2["layout"];
      const recordTypeName1 = access1["recordType"];
      const recordTypeName2 = access2["recordType"];

      if (layoutName1 !== layoutName2) {
        return layoutName1 > layoutName2 ? 1 : -1;
      } else {
        if (!recordTypeName1) return -1;
        if (!recordTypeName2) return 1;
        if (recordTypeName1 === recordTypeName2) return 0;
        return recordTypeName1 > recordTypeName2 ? 1 : -1;
      }
    case "loginIpRanges":
      if (
        normalizeIP(access1["startAddress"]) +
          "." +
          normalizeIP(access1["endAddress"]) ===
        normalizeIP(access2["startAddress"]) +
          "." +
          normalizeIP(access2["endAddress"])
      )
        return 0;
      return normalizeIP(access1["startAddress"]) +
        "." +
        normalizeIP(access1["endAddress"]) >
        normalizeIP(access2["startAddress"]) +
          "." +
          normalizeIP(access2["endAddress"])
        ? 1
        : -1;
    case "objectPermissions":
      if (access1["object"] === access2["object"]) return 0;
      return access1["object"] > access2["object"] ? 1 : -1;
    case "pageAccesses":
      if (access1["apexPage"] === access2["apexPage"]) return 0;
      return access1["apexPage"] > access2["apexPage"] ? 1 : -1;
    case "profileActionOverrides":
      if (access1["actionName"] === access2["actionName"]) return 0;
      return access1["actionName"] > access2["actionName"] ? 1 : -1;
    case "recordTypeVisibilities":
      if (access1["recordType"] === access2["recordType"]) return 0;
      return access1["recordType"] > access2["recordType"] ? 1 : -1;
    case "tabVisibilities":
      if (access1["tab"] === access2["tab"]) return 0;
      return access1["tab"] > access2["tab"] ? 1 : -1;
    case "userPermissions":
      if (access1["name"] === access2["name"]) return 0;
      return access1["name"] > access2["name"] ? 1 : -1;
    default:
      return 0;
  }
};

/**
 * Add leading zero to ip address numbers
 * @param ip
 */
const normalizeIP = (ip: string): string =>
  ip
    .split(".")
    .map((part) => part.padStart(3, "0"))
    .join(".");

/**
 * Substring from a text before given char
 * @param text
 * @param char
 */
const substringBefore = (text: string, char: string): string =>
  text.substring(0, text.indexOf(char));

/**
 * Substring from a text before given char
 * @param text
 * @param char
 */
const substringBeforeLast = (text: string, char: string): string =>
  text.substring(0, text.lastIndexOf(char));

/**
 * Substring from a text before given char
 * @param text
 * @param char
 */
const substringBeforeNthChar = (
  text: string,
  char: string,
  n: number
): string => text.split(char).slice(0, n).join(char);

/**
 * Substring from a text after given char
 * @param text
 * @param char
 */
const substringAfter = (text: string, char: string): string =>
  text.substring(text.indexOf(char) + 1);

/**
 * Substring from a text before given char
 * @param text
 * @param char
 */
const substringAfterLast = (text: string, char: string): string =>
  text.substring(text.lastIndexOf(char) + 1);

/**
 * Create directories recursively
 * @param path
 */
const mkdirRecursive = async (path: string): Promise<void> => {
  await fs.mkdirSync(path, {
    recursive: true,
  });
};

/**
 * Read a file
 * @param path
 */
const readFile = async (path: string): Promise<string> => {
  return await fs.readFileSync(path, {
    encoding: "utf8",
  });
};

/**
 * Write a file
 * @param path
 */
const writeFile = async (path: string, content: string): Promise<void> => {
  await fs.writeFileSync(path, content, {
    encoding: "utf8",
  });
};

/**
 * Write an xml file
 * @param path
 */
const writeXMLFile = async (path: string, content: string): Promise<void> => {
  await fs.writeFileSync(path, '<?xml version="1.0" encoding="UTF-8"?>\n', {
    encoding: "utf8",
  });

  await fs.writeFileSync(path, content, {
    encoding: "utf8",
    flag: "a",
  });
};

/**
 * Copy a file
 * @param sourcepath
 * @param destpath
 */
const copyFile = async (
  sourcepath: string,
  destpath: string
): Promise<void> => {
  if (fs.existsSync(sourcepath)) {
    await fs.copyFileSync(`${sourcepath}`, `${destpath}`);
  } else {
    throw `Error file "${sourcepath}" not found`;
  }
};

/**
 * copy folder source recusively to folder target
 * @param source
 * @param target
 */
const copyFolderRecursive = async (source, target) => {
  let files = [];

  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    for (const file of files) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        await copyFolderRecursive(curSource, targetFolder);
      } else {
        await copyFile(curSource, targetFolder + "/" + file);
      }
    }
  }
};

export {
  substringBefore,
  substringBeforeLast,
  substringBeforeNthChar,
  substringAfter,
  substringAfterLast,
  profileAccessFilenamesCompare,
  mkdirRecursive,
  readFile,
  writeFile,
  writeXMLFile,
  copyFile,
  copyFolderRecursive,
};
