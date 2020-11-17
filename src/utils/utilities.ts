/**
 * map name from on profile access
 */
const profileAccessNameMap = {
  applicationVisibilities: (profileAccess) => profileAccess["application"],
  categoryGroupVisibilities: (profileAccess) =>
    profileAccess["dataCategoryGroup"],
  customMetadataTypeAccesses: (profileAccess) => profileAccess["name"],
  classAccesses: (profileAccess) => profileAccess["apexClass"],
  custom: () => "custom",
  customPermissions: (profileAccess) => profileAccess["name"],
  customSettingAccesses: (profileAccess) => profileAccess["name"],
  description: () => "description",
  externalDataSourceAccess: (profileAccess) =>
    profileAccess["externalDataSource"],
  fieldPermissions: (profileAccess) => profileAccess["field"],
  flowAccesses: (profileAccess) => profileAccess["flowName"],
  fullName: () => "fullName",
  layoutAssignments: (profileAccess) =>
    profileAccess["layout"] +
    (profileAccess["recordType"] ? "." + profileAccess["recordType"] : ""),
  loginHours: () => "loginHours",
  loginIpRanges: (profileAccess) =>
    normalizeIP(profileAccess["startAddress"]) +
    "." +
    normalizeIP(profileAccess["endAddress"]),
  objectPermissions: (profileAccess) => profileAccess["object"],
  pageAccesses: (profileAccess) => profileAccess["apexPage"],
  profileActionOverrides: (profileAccess) => profileAccess["actionName"],
  recordTypeVisibilities: (profileAccess) => profileAccess["recordType"],
  tabVisibilities: (profileAccess) => profileAccess["tab"],
  userLicense: () => "userLicense",
  userPermissions: (profileAccess) => profileAccess["name"],
};

/**
 * compare profile access file names
 * @param fileName1
 * @param fileName2
 */
const profileAccessFilenamesCompare = (fileName1, fileName2) => {
  const accessType = uncapitalizeFirstLetter(substringBefore(fileName1, "."));
  switch (accessType) {
    case "layoutAssignments":
      const fileName1Parts = fileName1.split(".");
      const fileName2Parts = fileName2.split(".");

      const layoutName1 = substringBefore(substringAfter(fileName1, "."), ".");
      const layoutName2 = substringBefore(substringAfter(fileName2, "."), ".");

      if (fileName1Parts.length !== fileName2Parts.length) {
        if (layoutName1 === layoutName2) {
          return fileName1Parts.length > fileName2Parts.length ? 1 : -1;
        }
        return layoutName1 > layoutName2 ? 1 : -1;
      } else {
        if (layoutName1 !== layoutName2) {
          if (layoutName1.startsWith(layoutName2)) {
            return 1;
          }
          if (layoutName2.startsWith(layoutName1)) {
            return -1;
          }
        }
        return fileName1 > fileName2 ? 1 : -1;
      }
      break;
    default:
      return fileName1 > fileName2 ? 1 : -1;
  }
};

/**
 * Add leading zero to ip address numbers
 * @param ip
 */
const normalizeIP = (ip) =>
  ip
    .split(".")
    .map((part) => part.padStart(3, "0"))
    .join(".");

/**
 * Substring from a text before given char
 * @param text
 * @param char
 */
const substringBefore = (text, char) => text.substring(0, text.indexOf(char));

/**
 * Substring from a text after given char
 * @param text
 * @param char
 */
const substringAfter = (text, char) => text.substring(text.indexOf(char) + 1);

/**
 * Capitalize first letter of a string
 * @param string
 */
const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

/**
 * Uncapitalize first letter of a string
 * @param string
 */
const uncapitalizeFirstLetter = (string) =>
  string.charAt(0).toLowerCase() + string.slice(1);

export {
  profileAccessNameMap,
  substringBefore,
  capitalizeFirstLetter,
  uncapitalizeFirstLetter,
  profileAccessFilenamesCompare,
};
