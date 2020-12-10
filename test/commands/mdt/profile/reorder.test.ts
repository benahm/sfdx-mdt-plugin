import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import * as rimraf from "rimraf";
import Reoderer from "../../../../src/commands/mdt/profile/reorder";
import { x2jOptions } from "../../../../src/config/fastXMLOptions";

const testdatapath = "test/commands/mdt/profile/data";

describe("mdt:profile:reorder", () => {
  it("reorder custom labels", async () => {
    let reorderer = new Reoderer([], null);
    if (!fs.existsSync(`${testdatapath}/reorder/test1/result`)) {
      await fs.mkdirSync(`${testdatapath}/reorder/test1/result`);
    }

    await reorderer.reorder(
      `${testdatapath}/reorder/test1/Admin.profile-meta.xml`,
      `${testdatapath}/reorder/test1/result`
    );
    const myApp1xmldata = await fs.readFileSync(
      `${testdatapath}/reorder/test1/result/Admin.profile-meta.xml`,
      {
        encoding: "utf8",
      }
    );
    const profileJSON = x2jParser.parse(myApp1xmldata, x2jOptions);
    expect(profileJSON.Profile.applicationVisibilities[0].application).toEqual(
      "MyApp1"
    );
    expect(profileJSON.Profile.tabVisibilities.tab).toEqual("MyTab");
    expect(profileJSON.Profile.userLicense).toEqual("Salesforce");
    rimraf(`${testdatapath}/reorder/test1/result/*`, () => {});
  });
});
