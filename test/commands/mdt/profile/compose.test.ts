import * as fs from "fs";
import * as x2jParser from "fast-xml-parser";
import Composer from "../../../../src/commands/mdt/profile/compose";
import { x2jOptions } from "../../../../src/config/fastXMLOptions";

const testdatapath = "test/commands/mdt/profile/data";

describe("mdt:profile:compose", () => {
  it("compose two labels", async () => {
    let composer = new Composer([], null);

    await composer.compose(
      `${testdatapath}/compose/test1/Admin.profile-meta.xml`,
      `${testdatapath}/compose/test1/decomposed`
    );
    const xmlData = await fs.readFileSync(
      `${testdatapath}/compose/test1/Admin.profile-meta.xml`,
      {
        encoding: "utf8",
      }
    );
    const jsonObj = x2jParser.parse(xmlData, x2jOptions);
    expect(jsonObj.Profile.classAccesses.length).toEqual(2);
    expect(jsonObj.Profile.classAccesses[0].apexClass).toEqual("MyClass1");
    expect(jsonObj.Profile.classAccesses[1].apexClass).toEqual("MyClass2");
    await fs.unlinkSync(`${testdatapath}/compose/test1/Admin.profile-meta.xml`);
  });
});
