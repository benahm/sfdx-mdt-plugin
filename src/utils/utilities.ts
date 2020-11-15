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
    "-" +
    (profileAccess["recordType"] ? profileAccess["recordType"] : ""),
  loginHours: () => "loginHours",
  loginIpRanges: (profileAccess) =>
    normalizeIP(profileAccess["startAddress"]) +
    "-" +
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
 * Add leading zero to ip address numbers
 * @param ip
 */
const normalizeIP = (ip) => ip.split(".").map((part) => part.padStart(3, "0"));

/**
 * Substring from a text before given char
 * @param text
 * @param char
 */
const substringBefore = (text, char) => text.substring(0, text.indexOf(char));

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
};
