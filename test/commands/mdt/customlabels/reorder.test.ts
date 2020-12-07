import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import Orderer from "../../../../src/commands/mdt/customlabels/reorder";
import { x2jOptions } from "../../../../src/config/fastXMLOptions";

const testdatapath = "test/commands/mdt/customlabels/data";

describe("mdt:customlabels:reorder", () => {
  it("reorder test 1", async () => {
    const orderer = new Orderer([], null);

    await orderer.reorder(
      `${testdatapath}/reorder/test1/CustomLabels.labels-meta.xml`,
      `${testdatapath}/reorder/test1/result`
    );

    const xmlData = await fs.readFileSync(
      `${testdatapath}/reorder/test1/result/CustomLabels.labels-meta.xml`,
      {
        encoding: "utf8",
      }
    );

    const jsonObj = x2jParser.parse(xmlData, x2jOptions);
    expect(jsonObj.CustomLabels.labels.length).toEqual(2);
    expect(jsonObj.CustomLabels.labels[0].fullName).toEqual("label1");
    expect(jsonObj.CustomLabels.labels[1].fullName).toEqual("label2");
    await fs.unlinkSync(
      `${testdatapath}/reorder/test1/result/CustomLabels.labels-meta.xml`
    );
  });
});
