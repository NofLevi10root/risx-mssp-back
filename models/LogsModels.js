const { error } = require("ajv/dist/vocabularies/applicator/dependencies.js");
const DBConnection = require("../db.js");
const { DiscrError } = require("ajv/dist/vocabularies/discriminator/types.js");
const { exec } = require("child_process");
const fs = require("fs");
const fs_promises = require("fs").promises; // Import 'fs' with Promise-based API
const path = require("path");
const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;

async function get_log_model(logName, fileName) {
  let log_file_name = fileName;
  let log_File_Path = "";

  const risx_mssp_back_logs = ["log_mssp_backend"];
  const risx_mssp_python_script_logs = [
    "log_python_interval",
    "log_python_main",
    "log_alerts_interval",
    "log_crash",
    "log_daily_update_interval",
    "log_dashboard",
    "log_resource_usage",
    "log_collector",
    "log_collector_import",
    "log_AiManagement",
  ];

  try {
    if (risx_mssp_python_script_logs.includes(logName)) {
      log_File_Path = path.resolve(
        __dirname,
        "..",
        "..",
        relativePath,
        "logs",
        log_file_name
      );
    } else if (risx_mssp_back_logs.includes(logName)) {
      log_File_Path = path.resolve(
        __dirname,
        "..",
        "..",
        "risx-mssp-back",
        log_file_name
      );
    } else {
      console.log("logName not found");
    }

    // switch (logName) {

    // // case "log_mssp_backend":
    // // console.log("log_mssp_backend");

    // // log_File_Path = path.resolve(
    // // __dirname,
    // // "..",
    // // "..",
    // // "risx-mssp-back",
    // // log_file_name
    // // );
    // // break;

    // case "log_python_interval":
    // console.log("interval.log");

    // log_File_Path = path.resolve(
    // __dirname,
    // "..",
    // "..",
    // "risx-mssp-python-script",
    // "logs",
    // log_file_name
    // );
    // break;

    // case "log_python_main":
    // console.log("main.log");

    // log_File_Path = path.resolve(
    // __dirname,
    // "..",
    // "..",
    // "risx-mssp-python-script",
    // "logs",
    // log_file_name
    // );
    // break;

    // case "log_alerts_interval":
    // console.log("alerts_interval.log");

    // log_File_Path = path.resolve(
    // __dirname,
    // "..",
    // "..",
    // "risx-mssp-python-script",
    // "logs",
    // log_file_name
    // );
    // break;

    // case "log_crash":
    // console.log("Crash.log");
    // log_File_Path = path.resolve(
    //   __dirname,
    //   "..",
    //   "..",
    //   "risx-mssp-python-script",
    //   "logs",
    //   log_file_name
    // );
    // break;

    // case "log_daily_update_interval":
    // console.log("daily_update_interval.log");
    // log_File_Path = path.resolve(
    //   __dirname,
    //   "..",
    //   "..",
    //   "risx-mssp-python-script",
    //   "logs",
    //   log_file_name
    // );
    // break;

    // case "log_dashboard":
    // console.log("dashboard.log");
    // log_File_Path = path.resolve(
    //   __dirname,
    //   "..",
    //   "..",
    //   "risx-mssp-python-script",
    //   "logs",
    //   log_file_name
    // );
    // break;

    //       default:
    //         return `log file name: ${logName} is not recognize`;

    //     }

    // if (process.env.NODE_ENV === 'development') {
    //   path_to_mssp_config_json = path.join(__dirname, '..', '..', 'risx-mssp-front', `public`, mssp_config_json);

    // } else if (process.env.NODE_ENV === 'production') {
    //   path_to_mssp_config_json = path.join(__dirname, '..', '..', 'risx-mssp-front-build', mssp_config_json);
    // }

    // Check if the file exists
    // Check if the file exists
    const fileExists = await new Promise((resolve) => {
      fs.access(log_File_Path, fs.constants.F_OK, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });

    if (!fileExists) {
      return { status: 404, message: "Log file not found" };
    }

    // Read file contents
    const log_content = await new Promise((resolve, reject) => {
      fs.readFile(log_File_Path, "utf8", (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
    return { status: 200, content: log_content };
  } catch (error) {
    return { status: 500, message: `Error: ${error.message}` };
  }
}

module.exports = { get_log_model };
