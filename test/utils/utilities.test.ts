import {
  profileAccessNameMap,
  profileAccessFilenamesCompare,
} from "../../src/utils/utilities";

describe("utility tests", () => {
  it("profileAccessNameMap", async () => {
    expect(
      profileAccessNameMap["applicationVisibilities"]({ application: "MyApp" })
    ).toEqual("MyApp");

    expect(profileAccessNameMap["custom"]()).toEqual("custom");
    expect(
      profileAccessNameMap["layoutAssignments"]({ layout: "MyLayout" })
    ).toEqual("MyLayout");
    expect(
      profileAccessNameMap["layoutAssignments"]({
        layout: "MyLayout",
        recordType: "MyRecordType",
      })
    ).toEqual("MyLayout.MyRecordType");
    expect(
      profileAccessNameMap["loginIpRanges"]({
        startAddress: "1.1.1.1",
        endAddress: "255.255.255.255",
      })
    ).toEqual("001.001.001.001.255.255.255.255");
  });

  it("profileAccessFilenamesCompare", async () => {
    expect(
      profileAccessFilenamesCompare("ApexClass.Class2", "ApexClass.Class1")
    ).toEqual(1);
    expect(
      profileAccessFilenamesCompare("ApexClass.Class1", "ApexClass.Class2")
    ).toEqual(-1);
    expect(
      profileAccessFilenamesCompare(
        "LayoutAssignments.Layout1",
        "LayoutAssignments.Layout2"
      )
    ).toEqual(-1);
    expect(
      profileAccessFilenamesCompare(
        "LayoutAssignments.Layout1",
        "LayoutAssignments.Layout2.recordType2"
      )
    ).toEqual(-1);
    expect(
      profileAccessFilenamesCompare(
        "LayoutAssignments.LayoutA.recordTypeA",
        "LayoutAssignments.LayoutAb.recordTypeA"
      )
    ).toEqual(-1);
  });
});
