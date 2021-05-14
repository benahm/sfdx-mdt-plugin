/**
 * list metadata type full names
 * @param conn
 * @param metadataTypeName
 * @param folderName
 */
const listMetadataTypeFullNames = async (
  conn,
  metadataTypeName: string,
  folderName?: string
) => {
  const listMetadataQuery = folderName
    ? { type: metadataTypeName, folder: folderName }
    : { type: metadataTypeName };
  let metadataList = await conn.metadata.list([listMetadataQuery]);
  if(metadataList){
    if (!Array.isArray(metadataList)) {
      metadataList = [metadataList];
    }
    const metadataFullNameList = metadataList.map(
      (metadata) => metadata.fullName
    );
    return metadataFullNameList;
  }else{
    return [];
  }
};

/**
 * filter metadata type tags
 * @param conn
 * @param metadataJSON
 * @param tagName
 * @param metadataType
 * @param filterMetadata
 */
const filterMetadataTypeTag = async (
  conn,
  metadataJSON,
  tagName: string,
  metadataType: string,
  filterMetadata: (metadataTypeList: any[], metaStubJSON: any[]) => boolean
) => {
  const metadataStubJSON = metadataJSON[tagName];
  if (metadataStubJSON) {
    const metadataTypeFullNames = await listMetadataTypeFullNames(
      conn,
      metadataType
    );
    const metadataStubJSONList = Array.isArray(metadataStubJSON)
      ? metadataStubJSON
      : [metadataStubJSON];

    metadataJSON[tagName] = metadataStubJSONList.filter((metadataStubJSON) =>
      filterMetadata(metadataTypeFullNames, metadataStubJSON)
    );
    console.log(`${tagName} ✔️`);
  }
};

export { listMetadataTypeFullNames, filterMetadataTypeTag };
