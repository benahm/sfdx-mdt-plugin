/**
 * update workflow rule status
 * @param conn
 * @param objectname
 * @param rulename
 * @param status
 */
const updateWorkflowRuleStatus = async (conn, objectname, rulename, status) => {
  // read workflows from org
  const workflowJSON = await conn.metadata.readSync("Workflow", [objectname]);

  const workflowRules = workflowJSON["rules"].filter(
    (rule) => rule.fullName === rulename
  );
  if (workflowRules.length === 1) {
    const workflowRule = workflowRules[0];
    workflowRule.active = status; // update status
    const metadataUpdate = {
      fullName: objectname,
      rules: workflowRule,
    };
    const result = await conn.metadata.updateSync("Workflow", metadataUpdate);
    if (!result[1].success) {
      throw result[1].errors;
    }
  } else {
    throw "Workflow rule not found";
  }
};

export { updateWorkflowRuleStatus };
