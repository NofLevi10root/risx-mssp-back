const { get_log_model } = require("../models/LogsModels.js");
const DBConnection = require("../db.js");

async function Get_Log(req, res, next) {
  const { logName } = req.query;
  const { fileName } = req.query;

  if (logName === undefined) {
    console.log("logName is ", logName);
    return;
  }

  try {
    const log_file_data = await get_log_model(logName, fileName);

    res.send(log_file_data);
  } catch (err) {
    console.log("errrrrrrrrrrrrrrr", err);
  }
}

module.exports = {
  Get_Log,
};
