const fs = require("fs"); // Import 'fs' with Promise-based API
const DBConnection = require("../db.js");

async function GetDashFile(pathToFile) {
  try {
    const file = await fs.readFileSync(pathToFile, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    console.log("error in dash getter", error);
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
    console.log("error in dash getter", error);
    return false;
  }
}

module.exports = { GetDashFile, GetClientName };
