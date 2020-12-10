import { profileAccessFilenamesCompare } from "../../src/utils/utilities";

describe("utility tests", () => {
  it("profileAccessFilenamesCompare", async () => {
    expect(
      profileAccessFilenamesCompare(
        "classAccesses",
        { apexClass: "Class2" },
        { apexClass: "Class1" }
      )
    ).toEqual(1);
    expect(
      profileAccessFilenamesCompare(
        "classAccesses",
        { apexClass: "Class1" },
        { apexClass: "Class2" }
      )
    ).toEqual(-1);
    expect(
      profileAccessFilenamesCompare(
        "layoutAssignments",
        { layout: "Layout1" },
        { layout: "Layout2" }
      )
    ).toEqual(-1);
    expect(
      profileAccessFilenamesCompare(
        "layoutAssignments",
        { layout: "Layout1" },
        { layout: "Layout2", recordType: "recordType2" }
      )
    ).toEqual(-1);
    expect(
      profileAccessFilenamesCompare(
        "layoutAssignments",
        { layout: "LayoutA", recordType: "recordTypeA" },
        { layout: "LayoutAb", recordType: "recordTypeA" }
      )
    ).toEqual(-1);
  });
});
