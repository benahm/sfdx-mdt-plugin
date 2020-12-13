/**
 * list metadata type full names
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
  if (!Array.isArray(metadataList)) {
    metadataList = [metadataList];
  }
  const metadataFullNameList = metadataList.map(
    (metadata) => metadata.fullName
  );
  return metadataFullNameList;
};

/**
 *
 * @param profileJSON
 * @param profileAccessName
 * @param metadataType
 */
const filterMetadataTypeTag = async (
  conn,
  metadataJSON,
  tagName: string,
  metadataType: string,
  getTagFullName: (any) => string
) => {
  const profileAccess = metadataJSON[tagName];
  if (profileAccess) {
    const metadataTypeFullNames = await listMetadataTypeFullNames(
      conn,
      metadataType
    );
    const profileAccessList = Array.isArray(profileAccess)
      ? profileAccess
      : [profileAccess];

    metadataJSON[tagName] = profileAccessList.filter((profileAccess) =>
      metadataTypeFullNames.includes(getTagFullName(profileAccess))
    );
    console.log(`${tagName} ✔️`);
  }
};

export { listMetadataTypeFullNames, filterMetadataTypeTag };
