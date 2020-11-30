const j2xOptions = {
  attributeNamePrefix: "",
  attrNodeName: "@",
  textNodeName: "#text",
  ignoreAttributes: false,
  cdataTagName: "__cdata",
  cdataPositionChar: "\\c",
  format: true,
  indentBy: "    ",
  supressEmptyNode: false,
  tagValueProcessor: (a) => a,
  attrValueProcessor: (a) => a,
};

const x2jOptions = {
  attributeNamePrefix: "",
  attrNodeName: "@",
  textNodeName: "#text",
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: "__cdata",
  cdataPositionChar: "\\c",
  parseTrueNumberOnly: false,
  arrayMode: false,
  stopNodes: ["parse-me-as-string"],
  tagValueProcessor: (a) => a,
  attrValueProcessor: (a) => a,
};

export { j2xOptions, x2jOptions };
