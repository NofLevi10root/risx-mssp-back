const fs = require("fs"); // Import 'fs' with Promise-based API
const DBConnection = require("../db.js");

async function GetDashFile(pathToFile) {
  try {
    const file = await fs.readFileSync(pathToFile, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    console.error("error in dash getter", error);
    return false;
  }
}

async function GetClientName(id) {
  try {
    const [Arr] = await DBConnection.raw(
      `SELECT resource_string from all_resources where parent_id like "%${id}%" and type = 2008`
    );
    return Arr;
  } catch (error) {
    console.error("error in dash getter", error);
    return false;
  }
}

async function ClearResultsDataDashboardMod() {
  try {
    console.log("mod ClearResultsDataDashboardMod");

    const timeEpoch = Date.now();
    const IsoTime = new Date(timeEpoch).toISOString();
    console.log("this is date ", timeEpoch, IsoTime);

    const AletDic = await DBConnection.raw(
      `UPDATE configjson SET config = JSON_SET(config,'$.General.ResultsSortDate', '${IsoTime}')`
    );
    console.log("AletDicAletDicAletDicAletDicAletDicAletDic", AletDic);

    return true;
  } catch (error) {
    console.error("error in ClearResultsDataDashboardMod", error);
    return false;
  }
}

module.exports = { GetDashFile, GetClientName, ClearResultsDataDashboardMod };
