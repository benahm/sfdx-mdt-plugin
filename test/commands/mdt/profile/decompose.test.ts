import * as fs from "fs";
import { expect } from "chai";
import * as x2jParser from "fast-xml-parser";
import * as rimraf from "rimraf";
import Decomposer from "../../../../src/commands/mdt/profile/decompose";
import { x2jOptions } from "../../../../src/config/fastXMLOptions";

const testdatapath = "test/commands/mdt/profile/data";

describe("mdt:profile:decompose", () => {
  it("decompose custom labels", async () => {
    let decomposer = new Decomposer([], null);
    if (!fs.existsSync(`${testdatapath}/decompose/test1/decomposed`)) {
      await fs.mkdirSync(`${testdatapath}/decompose/test1/decomposed`);
    }

    await decomposer.decompose(
      `${testdatapath}/decompose/test1/Admin.profile-meta.xml`,
      `${testdatapath}/decompose/test1/decomposed`
    );
    const myApp1xmldata = await fs.readFileSync(
      `${testdatapath}/decompose/test1/decomposed/ApplicationVisibilities.MyApp1.xml`,
      {
        encoding: "utf8",
      }
    );
    const myApp1json = x2jParser.parse(myApp1xmldata, x2jOptions);
    expect(myApp1json.applicationVisibilities.application).to.equal("MyApp1");
    const myTabxmldata = await fs.readFileSync(
      `${testdatapath}/decompose/test1/decomposed/TabVisibilities.MyTab.xml`,
      {
        encoding: "utf8",
      }
    );
    const myTabjson = x2jParser.parse(myTabxmldata, x2jOptions);
    expect(myTabjson.tabVisibilities.tab).to.equal("MyTab");

    const userLicensexmldata = await fs.readFileSync(
      `${testdatapath}/decompose/test1/decomposed/UserLicense.userLicense.xml`,
      {
        encoding: "utf8",
      }
    );
    const userLicensejson = x2jParser.parse(userLicensexmldata, x2jOptions);
    expect(userLicensejson.userLicense).to.equal("Salesforce");
    rimraf(`${testdatapath}/decompose/test1/decomposed/*`, () => {});
  });
});
