const { get_log_model, DeleteLogModal } = require("../models/LogsModels.js");
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
    console.error("errrrrrrrrrrrrrrr", err);
  }
}

async function DeleteLog(req, res, next) {
  const { logName } = req.body;
  const { fileName } = req.body;
  console.log("Start DeleteLog DeleteLog ", req.body);

  if (logName === undefined) {
    console.log("logName is ", logName);
    return;
  }
  

  try {
    const log_file_data = await DeleteLogModal(logName, fileName);

    res.send(log_file_data);
  } catch (err) {
    console.error("errrrrrrrrrrrrrrr", err);
  }
}

module.exports = {
  DeleteLog,
  Get_Log,
};
