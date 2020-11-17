import { expect } from "chai";
import {
  profileAccessNameMap,
  profileAccessFilenamesCompare,
} from "../../src/utils/utilities";

describe("utility tests", () => {
  it("profileAccessNameMap", async () => {
    expect(
      profileAccessNameMap["applicationVisibilities"]({ application: "MyApp" })
    ).equal("MyApp");

    expect(profileAccessNameMap["custom"]()).equal("custom");
    expect(
      profileAccessNameMap["layoutAssignments"]({ layout: "MyLayout" })
    ).equal("MyLayout");
    expect(
      profileAccessNameMap["layoutAssignments"]({
        layout: "MyLayout",
        recordType: "MyRecordType",
      })
    ).equal("MyLayout.MyRecordType");
    expect(
      profileAccessNameMap["loginIpRanges"]({
        startAddress: "1.1.1.1",
        endAddress: "255.255.255.255",
      })
    ).equal("001.001.001.001.255.255.255.255");
  });

  it("profileAccessFilenamesCompare", async () => {
    expect(
      profileAccessFilenamesCompare("ApexClass.Class2", "ApexClass.Class1")
    ).equal(1);
    expect(
      profileAccessFilenamesCompare("ApexClass.Class1", "ApexClass.Class2")
    ).equal(-1);
    expect(
      profileAccessFilenamesCompare(
        "LayoutAssignments.Layout1",
        "LayoutAssignments.Layout2"
      )
    ).equal(-1);
    expect(
      profileAccessFilenamesCompare(
        "LayoutAssignments.Layout1",
        "LayoutAssignments.Layout2.recordType2"
      )
    ).equal(-1);
  });
});
