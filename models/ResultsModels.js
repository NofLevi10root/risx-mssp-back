const fs = require("fs").promises;
const fs_non_promises = require("fs");
const csv = require("csv-parser");
const path = require("path");
const DBConnection = require("../db.js");
const { exec } = require("child_process");
const { spawn } = require("child_process");
const { log } = require("console");

async function Checking_if_file_exists_model(ResponsePath) {
  try {
    // Read environment variable for scripts folder path
    const SCRIPTS_FOLDER = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;

    // Resolve the file path
    const filePath = path.resolve(
      __dirname,
      "..",
      "..",
      SCRIPTS_FOLDER,
      ResponsePath
    );
    console.log(`filePath: ${filePath}`);

    // Check if the file exists
    await fs.access(filePath);
    console.log(`File found: ${filePath}`);

    return { success: true };
  } catch (err) {
    if (err.code === "ENOENT") {
      // File does not exist
      console.error(`File or folder does not exist: ${filePath}`);
      return {
        success: false,
        message: `File or folder does not exist: ${filePath}`,
      };
    } else {
      // Other errors
      console.error("File or folder does not exist:", err);
      return { success: false, message: "File or folder does not exist." };
    }
  }
}

async function delete_json_results_file_model() {
  const ResponsePath = "response_folder/tmp2.json";

  try {
    // Read environment variable for scripts folder path
    const SCRIPTS_FOLDER = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;

    // Resolve the file path
    const filePath = path.resolve(
      __dirname,
      "..",
      "..",
      SCRIPTS_FOLDER,
      ResponsePath
    );
    console.log(`filePath: ${filePath}`);

    // Check if the file exists
    await fs.access(filePath);
    console.log(`File found: ${filePath}`);

    // Delete the file
    await fs.unlink(filePath);
    console.log(`File deleted: ${filePath}`);

    return { success: true, message: `File deleted 55: ${filePath}` };
  } catch (err) {
    if (err.code === "ENOENT") {
      // File does not exist
      console.error(`File or folder does not exist: ${filePath}`);
      return {
        success: false,
        message: `File or folder does not exist 22: ${filePath}`,
      };
    } else {
      // Other errors
      console.error("Error deleting file:", err);
      return { success: false, message: "Error deleting file. 33" };
    }
  }
}

async function get_all_latest_results_dates(results) {
  if (results === undefined) {
    console.log("---results--:-  ", results);
    return {};
  }

  try {
    let lastResults = {};
    const filterd_Velociraptor = results.filter(
      (element) => element.ModuleName === "Velociraptor"
    );
    const filterd_Hunting = results.filter(
      (element) => element.Status === "Hunting"
    );
    const filterd_InProgress = results.filter(
      (element) => element.Status === "in Progress"
    );
    const filterd_Complete = results.filter(
      (element) => element.Status === "Complete"
    );
    const filterd_Failed = results.filter(
      (element) => element.Status === "Failed"
    );

    const check_last_resault = (filterd_array, filter_name) => {
      if (filterd_array.length === 0 || filterd_array === undefined) {
        // console.log("filter_name",filter_name ,"is",filterd_array);
        lastResults = { ...lastResults, [filter_name]: "NA" };
        return;
      }

      let latestDate = null;

      for (let index = 0; index < filterd_array.length; index++) {
        // console.log("filterd_array[index]",filterd_array[index]);
        const date = filterd_array[index]?.LastIntervalDatePrecise;
        if (!latestDate || new Date(date) > new Date(latestDate)) {
          latestDate = date;
        }
      }

      lastResults = { ...lastResults, [filter_name]: latestDate };

      console.log(`Latest date in ${filter_name}:`, latestDate);
    };

    check_last_resault(filterd_Velociraptor, "Velociraptor");
    check_last_resault(filterd_Hunting, "Hunting");
    check_last_resault(filterd_InProgress, "in Progress");
    check_last_resault(filterd_Complete, "Complete");
    check_last_resault(filterd_Failed, "Failed");
    check_last_resault(results, "Total");

    console.log("lastResults", lastResults);
    // const ReqestStatus = await get_ReqestStatus_from_config_file();
    // await add_time_note(ReqestStatus);

    if (lastResults) {
      return lastResults;
    }
  } catch (err) {
    console.error("Error in get_all_latest_results_dates :", err);

    return err.message;
    next(err);
  }
}

function string_to_date(dateString) {
  try {
    const dateStringArray = dateString.split("-");
    const day = dateStringArray[0];
    const month = dateStringArray[1];
    const year = dateStringArray[2];
    const hour = dateStringArray[3];
    const minute = dateStringArray[4];
    const second = dateStringArray[5];
    const event = new Date(
      `${month} ${day}, ${year} ${hour}:${minute}:${second}`
    );

    return event;
  } catch (err) {
    console.error(err);
    return "error in date";
  }
}

function roundIfDecimal(number) {
  // Check if the number has a decimal point
  if (number % 1 !== 0) {
    // Round to one decimal place and return as a number
    return parseFloat(number.toFixed(1));
  }
  // Return the number as is if it doesn't have a decimal point
  return number;
}

function compare_dates(end_date, start_date) {
  try {
    const compare = (end_date - start_date) / 60000;
    if (compare > 0) {
      // console.log("in time");
      return "In Time";
    }
    if (compare < 0) {
      //  console.log("not in time" );

      if (-compare <= 59) {
        // console.log("pass by", -compare, "Min");
        const return_this = "+" + roundIfDecimal(-compare) + " Min";
        console.log("return_this", return_this);

        return return_this;
      }

      if (59 < -compare && 1439 > -compare) {
        const hours = Math.floor(-compare / 60);
        const minutes = -compare % 60;

        let return_this_2;

        if (hours != 1) {
          return_this_2 = "+" + hours + " Hrs";
        } else if (hours === 1) {
          return_this_2 = "+" + hours + " Hr";
        }
        // else if(minutes !=0) {return_this_2 = "+"+hours + " Hrs " + minutes + " Mins";}

        return return_this_2;
      }
      if (1440 <= -compare) {
        const days = Math.floor(-compare / 1440);
        const remainingHours = Math.floor((-compare % 1440) / 60); // Calculate remaining hours
        const return_this = "+" + days + " Days";
        return return_this;
      }
    }

    return;
  } catch (err) {
    console.error(err);
    return "check compare_dates";
  }
}

async function add_time_note(ReqestStatus) {
  try {
    for (let i = 0; i < ReqestStatus.length; i++) {
      const LastIntervalDate = await string_to_date(
        ReqestStatus[i]?.LastIntervalDate
      );

      console.log("LastIntervalDate --------  333", ReqestStatus[i]?.Status);

      ReqestStatus[i].LastIntervalDatePrecise = LastIntervalDate;
      if (
        ReqestStatus[i]?.Status === "Complete" ||
        ReqestStatus[i]?.Status === "Hunting" ||
        ReqestStatus[i]?.Status === "In Progress"
      ) {
        //  console.log("ddddddddddd 444"  ,ReqestStatus[i]?.ModuleName       );
        // console.log("----ReqestStatus[i]?.ExpireDate----", ReqestStatus[i]?.ExpireDate);

        const ExpireDate = string_to_date(ReqestStatus[i]?.ExpireDate);

        if (
          ReqestStatus[i]?.ExpireDate === "" ||
          ReqestStatus[i]?.ExpireDate === undefined
        ) {
          ReqestStatus[i].TimeNote = "NoExpireDate";
          return;
        } else {
          const note = compare_dates(ExpireDate, LastIntervalDate);

          ReqestStatus[i].TimeNote = note;
        }
      }
    }
    return "ddddd";
  } catch (err) {
    console.error("add_time_note ", err);

    return err;
  }
}

async function get_ReqestStatus_from_config_file() {
  try {
    const [ReqestStatus] = await DBConnection.raw(
      'SELECT JSON_EXTRACT(config,"$.RequestStatus") as data FROM configjson;'
    );

    const [[AletDic]] = await DBConnection.raw(
      'SELECT JSON_EXTRACT(config,"$.General.ResultsSortDate") as a from configjson'
    );
    const moonLanding = new Date(AletDic.a);
    const SortDate = moonLanding.getTime();

    const filteredArray = await ReqestStatus?.[0].data?.filter((x) => {
      const [day, month, year, hour, minute, second] =
        x?.StartDate.split("-").map(Number);
      const date = new Date(
        Date.UTC(year, month - 1, day, hour, minute, second)
      );
      const xDate = date.getTime();

      console.log(xDate, SortDate); // outputs: 1745381014

      if (xDate > SortDate) {
        return true;
      } else {
        return false;
      }
    });
    console.log("filteredArray", filteredArray);

    return filteredArray;
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    return []; // Return an empty array in case of error
  }
}

async function check_file_size(file_name) {
  console.log("-------check_file_size-----");
  try {
    const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const directoryPath = path.join(__dirname, "..", "..", relativePath);
    const fullPath = path.join(directoryPath, file_name);

    console.log("check_file_size directoryPath - ", directoryPath);

    // Check if the directory exists (will throw if it doesn't)
    await fs.access(directoryPath);

    // Get file stats asynchronously
    const stats = await fs.stat(fullPath);
    // console.log("check_file_size stats - file_name: ", file_name, stats);

    const fileSizeInBytes = stats.size;
    console.log("check_file_size fileSizeInBytes - ", fileSizeInBytes);

    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    console.log("check_file_size fileSizeInMegabytes - ", fileSizeInMegabytes);

    return fileSizeInMegabytes; // Return the size in megabytes
  } catch (err) {
    console.error("check_file_size:", err);
    throw err; // Propagate the error to handle it further up the call stack
  }
}

async function get_requests_csv_table_model() {
  const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
  const directoryPath = path.join(__dirname, "..", "..", relativePath);
  const filePath = path.join(
    __dirname,
    "..",
    "..",
    relativePath,
    "RequestsTable.csv"
  );

  try {
    // Check if the directory exists (will throw if it doesn't)
    await fs.access(directoryPath);
    // Read the CSV file
    // const data = await fs.readFile(filePath, 'utf8');

    if (filePath) return filePath;
  } catch (err) {
    console.error("Error reading or parsing file:", err);
  }
}

async function make_cool_object_from_csv_table(filePath) {
  try {
    const results = [];

    const stream = fs_non_promises
      .createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data));

    // Wait for the 'end' event to be emitted to ensure the CSV parsing is complete
    await new Promise((resolve, reject) => {
      stream.on("end", () => {
        console.log("CSV parsing complete");
        resolve();
      });
      stream.on("error", reject);
    });

    return results;
  } catch (err) {
    console.error("Error reading or parsing file:", err);
    return []; // Return an empty array in case of error
  }
}

async function get_all_velociraptor_artifacts_model() {
  try {
    const all_velociraptor_artifacts = await DBConnection("artifacts").select(
      "*"
    );
    if (all_velociraptor_artifacts) {
      return all_velociraptor_artifacts;
    }
  } catch (err) {
    console.error("Error in get_all_velociraptor_artifacts_model :", err);

    res.send(err);
  }
}

async function get_velociraptor_aggregate_macro_model(
  SubModuleName,
  ResponseFile
) {
  console.log(
    "get_velociraptor_aggregate_macro_model",
    SubModuleName,
    ResponseFile
  );

  let macro_file_name = "";

  // console.log("nnnnnnnnnnnnnnnnnnnnnnn",ResponseFile);

  try {
    // if(  ResponseFile.includes("response_")){  macro_file_name = ResponseFile.replace("response", "macro");}
    if (ResponseFile.includes("response_")) {
      const fileName = ResponseFile.split("/").pop();

      // משנים את "response" ל-"macro"
      macro_file_name = fileName.replace("response", "macro");
    }

    const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const directoryPath = path.join(
      __dirname,
      "..",
      "..",
      relativePath,
      "response_folder"
    );
    // const directoryPath = path.join(__dirname, '..','..', relativePath);
    // const fullPath = path.join(directoryPath, `${macro_file_name}.json`);
    const fullPath = path.join(directoryPath, macro_file_name);

    console.log("sssssssssssssssssssssssssssss", fullPath);
    await fs.access(directoryPath);

    const JSON_file = await fs.readFile(fullPath, "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    if (JSON_file) {
      // console.log("JSON_file", JSON_file);
      const [parsed] = await JSON.parse(JSON_file);

      return parsed;
    }
  } catch (err) {
    console.error("Error get_velociraptor_aggregate_macro_model:", err);
  }
}

async function order_result_aggregate_macro_model(result) {
  if (result === undefined) {
    return false;
  }

  try {
    // console.log("result jjjjjjjjjj0", result);
    // console.log(result['Failed Test/Number of tests']);
    const string = result["Failed Test/Number of tests"];
    const Failed_Test_Number_of_tests = string.split("/");
    const convertedNumbers = Failed_Test_Number_of_tests.map((numStr) =>
      Number(numStr)
    );
    result.Failed_Test_Number_of_tests = convertedNumbers;

    //  const severityOrder = ['Critical', 'High', 'Medium', 'Low'];

    //  const severities = severityOrder;
    //  const counts = severityOrder.map(severity => inputObject[`Count of ${severity}`]);

    //  console.log('const severities =', JSON.stringify(severities), ';');
    //  console.log('const counts =', JSON.stringify(counts), ';');

    const severityOrder = ["Critical", "High", "Medium", "Low"];
    const severities = severityOrder;
    const counts = severityOrder.map(
      (severity) => result[`Count of ${severity}`]
    );
    console.log("const severities =", JSON.stringify(severities), ";");
    console.log("const counts =", JSON.stringify(counts), ";");
    result.severity_Order = severities;
    result.severity_Counts = counts;

    return result;
  } catch (err) {
    console.error("order_result_aggregate_macro_model", err);
    return err;
  }
}

async function get_single_velociraptor_result_model(file_name) {
  const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
  const directoryPath = path.join(__dirname, "..", "..", relativePath);
  // let fullPath =""
  // const   fullPath = path.join(directoryPath,`\\`,file_name);
  const fullPath = path.join(directoryPath, file_name);

  // Check if the directory exists (will throw if it doesn't)
  await fs.access(directoryPath);

  const JSON_file = await fs.readFile(fullPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  if (JSON_file) {
    const parsed = JSON.parse(JSON_file);

    if (parsed?.error === "No data collected.") {
      return "No data collected.";
    }
    // console.log("parsed?.table   eeeeeeeeeeeeeeeeeeeeeeeeee",parsed?.table );
    if (parsed?.table && parsed?.table.length != 0) {
      parsed.table = JSON.parse(parsed.table);
    }

    return parsed;
  }
}

async function count_response_files_model() {
  try {
    const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const directoryPath = path.join(__dirname, "..", "..", relativePath);

    // Check if the directory exists (will throw if it doesn't)
    await fs.access(directoryPath);

    // Read directory contents
    const allfiles = await fs.readdir(directoryPath);
    const files = allfiles.filter((file) => file.startsWith("response_"));
    const number = { number: files?.length };

    // console.log("json_files_array" ,json_files_array);
    return number;
  } catch (err) {
    console.error("Error accessing or reading the directory:", err);
  }
}

async function find_latest_response_and_request(module_id) {
  try {
    const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const directoryPath = path.join(__dirname, "..", "..", relativePath);

    // Check if the directory exists (will throw if it doesn't)
    await fs.access(directoryPath);

    // Read directory contents
    const allfiles = await fs.readdir(directoryPath);

    let last_response = 0;
    let last_request = 0;
    // let times = {last_response:last_response , last_request:last_request}
    const response_files = allfiles.filter(
      (file) =>
        file.startsWith("response") && file.endsWith(`${module_id}.json`)
    );

    for (const file of response_files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);

      if (!last_response || stats.birthtime > last_response) {
        {
          last_response = stats.birthtime;
        }
      }
    }

    const request_files = allfiles.filter(
      (file) => file.startsWith("request") && file.endsWith(`${module_id}.json`)
    );

    for (const file of request_files) {
      const filePath = path.join(directoryPath, file);
      const stats = await fs.stat(filePath);

      if (!last_request || stats.birthtime > last_request) {
        {
          last_request = stats.birthtime;
        }
      }
    }

    return { last_response: last_response, last_request: last_request };
  } catch (err) {
    console.error("Error find latest_response_and_request:", err);
  }
}

async function ImportVeloResultModal(command) {
  try {
    console.log(command, "command for ImportVeloResultModal");

    return new Promise((resolve, reject) => {
      try {
        exec(command, { shell: "/bin/bash" }, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing command: ${error.message}`);
            resolve(false);
            return;
          }

          if (stderr) {
            console.error(`Error: ${stderr}`);
            // resolve(false);
            return;
          }

          // Check if any line contains the file name
          const lines = stdout?.trim()?.split("\n");
          console.log("Start of stdout");
          console.log(lines);
          console.log("End of stdout");
          resolve(true);
        });
      } catch (error) {
        console.error("Error in exec ImportVeloResultModal ", error);
        resolve(false);
      }
    });
  } catch (err) {
    console.error("Error ImportVeloResultModal", err);
    return false;
  }
}

module.exports = {
  ImportVeloResultModal,
  // get_all_velociraptor_results_model,
  get_all_velociraptor_artifacts_model,
  get_single_velociraptor_result_model,
  count_response_files_model,
  find_latest_response_and_request,
  // get_all_request_and_response_model,
  get_requests_csv_table_model,
  make_cool_object_from_csv_table,
  check_file_size,
  get_ReqestStatus_from_config_file,
  add_time_note,
  get_all_latest_results_dates,
  get_velociraptor_aggregate_macro_model,
  order_result_aggregate_macro_model,
  delete_json_results_file_model,
  Checking_if_file_exists_model,
};
