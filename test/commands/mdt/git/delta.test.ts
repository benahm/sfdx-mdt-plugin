// import * as fs from "fs";
import { expect } from "chai";
import * as x2jParser from "fast-xml-parser";
import { j2xParser } from "fast-xml-parser";
import Differ from "../../../../src/commands/mdt/git/delta";
import { j2xOptions } from "../../../../src/config/fastXMLOptions";

describe("mdt:git:delta", () => {
  it("metadataToJSArray", async () => {
    const differ = new Differ([], null);

    const result = differ.metadataToJSArray(
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
    expect(result.length).to.equal(2);
    expect(JSON.parse(result[0]).tagName).to.equal("labels");
    expect(JSON.parse(result[0]).fullName).to.equal("label1");
  });
  it("diffMetadata", async () => {
    const differ = new Differ([], null);

    const json2xmlParser = new j2xParser(j2xOptions);
    const result = differ.diffMetadata(
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
      ""
    );
    expect(x2jParser.parse(result).CustomLabels.labels.length).to.equal(2);
  });
});
