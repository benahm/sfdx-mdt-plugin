import * as fs from "fs";

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
      return access1["application"] > access2["application"] ? 1 : -1;
    case "categoryGroupVisibilities":
      return access1["dataCategoryGroup"] > access2["dataCategoryGroup"]
        ? 1
        : -1;
    case "customMetadataTypeAccesses":
      return access1["name"] > access2["name"] ? 1 : -1;
    case "classAccesses":
      return access1["apexClass"] > access2["apexClass"] ? 1 : -1;
    case "customPermissions":
      return access1["name"] > access2["name"] ? 1 : -1;
    case "customSettingAccesses":
      return access1["name"] > access2["name"] ? 1 : -1;
    case "externalDataSourceAccess":
      return access1["externalDataSource"] > access2["externalDataSource"]
        ? 1
        : -1;
    case "fieldPermissions":
      return access1["field"] > access2["field"] ? 1 : -1;
    case "flowAccesses":
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
        return recordTypeName1 > recordTypeName2 ? 1 : -1;
      }
    case "loginIpRanges":
      return normalizeIP(access1["startAddress"]) +
        "." +
        normalizeIP(access1["endAddress"]) >
        normalizeIP(access2["startAddress"]) +
          "." +
          normalizeIP(access2["endAddress"])
        ? 1
        : -1;
    case "objectPermissions":
      return access1["object"] > access2["object"] ? 1 : -1;
    case "pageAccesses":
      return access1["apexPage"] > access2["apexPage"] ? 1 : -1;
    case "profileActionOverrides":
      return access1["actionName"] > access2["actionName"] ? 1 : -1;
    case "recordTypeVisibilities":
      return access1["recordType"] > access2["recordType"] ? 1 : -1;
    case "tabVisibilities":
      return access1["tab"] > access2["tab"] ? 1 : -1;
    case "userPermissions":
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
 *
 * @param path
 */
const mkdirRecursive = async (path: string): Promise<void> => {
  await fs.mkdirSync(path, {
    recursive: true,
  });
};

/**
 *
 * @param path
 */
const readFile = async (path: string): Promise<string> => {
  return await fs.readFileSync(path, {
    encoding: "utf8",
  });
};

/**
 *
 * @param path
 */
const writeFile = async (path: string, content: string): Promise<void> => {
  await fs.writeFileSync(path, content, {
    encoding: "utf8",
  });
};

/**
 *
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
 * copy a file
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
    throw `Error file ${sourcepath} not found`;
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
};
