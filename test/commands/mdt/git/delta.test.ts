// import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";
import {
  metadataToJSArray,
  diffChangesInMetadata,
} from "../../../../src/utils/delta";
import { j2xOptions } from "../../../../src/config/fastXMLOptions";

describe("mdt:git:delta", () => {
  it("metadataToJSArray", async () => {
    const result = metadataToJSArray(
      {
        CustomLabels: {
          labels: [
            {
              fullName: "label1",
              value: "value1",
            },
            {
              fullName: "label2",
              value: "value2",
            },
          ],
        },
      },
      "CustomLabels"
    );
    expect(result.length).toEqual(2);
    expect(JSON.parse(result[0]).tagName).toEqual("labels");
    expect(JSON.parse(result[0]).fullName).toEqual("label1");
  });
  it("diffMetadata", async () => {
    const json2xmlParser = new j2xParser(j2xOptions);
    const result = diffChangesInMetadata(
      json2xmlParser.parse({
        CustomLabels: {
          labels: [
            {
              fullName: "label1",
              value: "value1",
            },
            {
              fullName: "label2",
              value: "value2",
            },
            {
              fullName: "label3",
              value: "value3",
            },
          ],
        },
      }),
      json2xmlParser.parse({
        CustomLabels: {
          labels: [
            {
              fullName: "label1",
              value: "value1111",
            },
            {
              fullName: "label2222",
              value: "value2",
            },
            {
              fullName: "label3",
              value: "value3",
            },
          ],
        },
      }),
      "CustomLabels",
      (array, item) => !array.includes(item)
    );
    expect(x2jParser.parse(result).CustomLabels.labels.length).toEqual(2);
  });
});
