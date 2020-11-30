/**
 * list metadata type full names
 * @param metadataTypeName
 * @param folderName
 */
const listMetadataTypeFullNames = async (
  conn,
  metadataTypeName,
  folderName?
) => {
  const listMetadataQuery = folderName
    ? { type: metadataTypeName, folder: folderName }
    : { type: metadataTypeName };
  const metadataList = await conn.metadata.list([listMetadataQuery]);

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
  tagName,
  metadataType,
  getTagFullName
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
