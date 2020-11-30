import * as fs from "fs";
import { expect } from "chai";
import * as x2jParser from "fast-xml-parser";
import Composer from "../../../../src/commands/mdt/customlabels/compose";
import { x2jOptions } from "../../../../src/config/fastXMLOptions";

const testdatapath = "test/commands/mdt/customlabels/data";

describe("mdt:customlabels:compose", () => {
  it("compose two labels", async () => {
    let composer = new Composer([], null);

    await composer.compose(
      `${testdatapath}/compose/test1/CustomLabels.labels-meta.xml`,
      `${testdatapath}/compose/test1/decomposed`
    );
    const xmlData = await fs.readFileSync(
      `${testdatapath}/compose/test1/CustomLabels.labels-meta.xml`,
      {
        encoding: "utf8",
      }
    );
    const jsonObj = x2jParser.parse(xmlData, x2jOptions);
    expect(jsonObj.CustomLabels.labels.length).to.equal(2);
    expect(jsonObj.CustomLabels.labels[0].fullName).to.equal("label1");
    expect(jsonObj.CustomLabels.labels[1].fullName).to.equal("label2");
    await fs.unlinkSync(
      `${testdatapath}/compose/test1/CustomLabels.labels-meta.xml`
    );
  });
  it("compose three labels", async () => {
    let composer = new Composer([], null);

    await composer.compose(
      `${testdatapath}/compose/test2/CustomLabels.labels-meta.xml`,
      `${testdatapath}/compose/test2/decomposed`
    );
    const xmlData = await fs.readFileSync(
      `${testdatapath}/compose/test2/CustomLabels.labels-meta.xml`,
      {
        encoding: "utf8",
      }
    );
    const jsonObj = x2jParser.parse(xmlData, x2jOptions);
    expect(jsonObj.CustomLabels.labels.length).to.equal(3);
    expect(jsonObj.CustomLabels.labels[0].fullName).to.equal("labelZ");
    expect(jsonObj.CustomLabels.labels[1].fullName).to.equal("labela");
    await fs.unlinkSync(
      `${testdatapath}/compose/test2/CustomLabels.labels-meta.xml`
    );
  });
});
