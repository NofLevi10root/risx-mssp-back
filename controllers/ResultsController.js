const {
  check_file_size,
  get_single_velociraptor_result_model,
  count_response_files_model,
  find_latest_response_and_request,
  Checking_if_file_exists_model,
  get_all_latest_results_dates,
  get_ReqestStatus_from_config_file,
  add_time_note,
  check_main_process_status_model,
  get_velociraptor_aggregate_macro_model,
  order_result_aggregate_macro_model,
  delete_json_results_file_model,
  ImportVeloResultModal,
} = require("../models/ResultsModels");
const {
  get_all_Modules_model,
  all_Modules_id_and_trashold,
  all_Artifacts_id_and_trashold,
} = require("../models/ToolsModels");

const DBConnection = require("../db.js");
const { v4: uuid } = require("uuid");
const path = require("path");
const fs = require("fs").promises;
const fs_non_promises = require("fs");
const { error } = require("console");

async function download_json_file(req, res, next) {
  try {
    const { ResponsePath } = req.query;
    if (!ResponsePath) {
      console.log("ResponsePath is", ResponsePath);
      return res.status(400).send("ResponsePath is required");
    }

    const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const directoryPath = path.join(__dirname, "..", "..", relativePath);
    const fullPath = path.join(directoryPath, ResponsePath);
    console.log("fullPath ---------------------------", fullPath);

    await fs.access(directoryPath); // Check file existence asynchronously

    if (fs_non_promises.existsSync(fullPath)) {
      // Set headers to force download
      res.setHeader(
        "Content-disposition",
        `attachment; filename=${path.basename(fullPath)}`
      );
      res.setHeader("Content-type", "application/json");

      // Create a read stream from the file and pipe it to the response
      const fileStream = fs_non_promises.createReadStream(fullPath);
      fileStream.pipe(res);
    } else {
      res.status(404).send("File not found");
    }

    //   return    res.send(result)}
  } catch (err) {
    res.send(err.message);
    res.status(500).send("Server error");
    next(err);
  }
}

async function get_single_velociraptor_response(req, res, next) {
  const { file_name } = req.query;
  console.log("get_single_velociraptor_response", file_name);

  try {
    const size = await check_file_size(file_name);

    //  const MB_limit = 0.022
    const MB_limit = 1;

    console.log("file size= ", size, "MB_limit= ", MB_limit);
    console.log(" MB_limit < size ", MB_limit < size);

    if (MB_limit < size) {
      console.log("json file too big", size);

      return res.status(200).json({
        success: false,
        fileSize: "Too big",
        mbSize: size,
        message: `File is too big. Maximum size allowed is ${MB_limit} MB.`,
      });
    } else {
      const result = await get_single_velociraptor_result_model(file_name);
      if (result) {
        return res.send(result);
      }
    }
  } catch (err) {
    res.send(err.message);
    next(err);
  }
}

async function get_velociraptor_aggregate_macro(req, res, next) {
  // console.log();
  const { SubModuleName, ResponseFile } = req.query;

  console.log("get_velociraptor_aggregate_macro  ResponseFile", ResponseFile);
  console.log("get_velociraptor_aggregate_macro SubModuleName", SubModuleName);
  if (ResponseFile === undefined || SubModuleName === undefined) {
    res.status(400).json({
      success: false,
      message: `'ResponseFile is ${ResponseFile} ,SubModuleName is ${SubModuleName}`,
    });
  }

  try {
    const result = await get_velociraptor_aggregate_macro_model(
      SubModuleName,
      ResponseFile
    );
    const order_result = await order_result_aggregate_macro_model(result);

    if (order_result) {
      console.log("result", order_result);
      res.json({ success: true, data: order_result });
    }
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

async function get_all_requests_table(req, res, next) {
  let results = {
    results_list: [],
    latest_dates: {},
  };

  try {
    const ReqestStatus = await get_ReqestStatus_from_config_file();
    await add_time_note(ReqestStatus);
    const latest = await get_all_latest_results_dates(ReqestStatus);
    //  console.log("latest 555555555",latest);

    // const all_Modules = await get_all_Modules_model();
    results.results_list = ReqestStatus;
    results.latest_dates = latest;

    if (ReqestStatus) {
      res.send(results);
    }
  } catch (err) {
    res.send(err.message);
    next(err);
  }
}

async function count_velociraptor_responses(req, res, next) {
  try {
    const number = await count_response_files_model();
    if (number) {
      res.send(number);
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function check_last_req_and_res_for_module(req, res, next) {
  const { module_id } = req.query;
  if (module_id === undefined || module_id === "" || module_id === null) {
    res.send("no module id");
    return;
  }

  try {
    // const Modules_id_and_trashold = await all_Modules_id_and_trashold()
    // const Artifacts_id_and_trashold = await all_Artifacts_id_and_trashold()

    const latest = await find_latest_response_and_request(module_id);

    // console.log("all_Modules_id_and_trashold" ,Modules_id_and_trashold);
    // console.log("Artifacts_id_and_trashold" ,Artifacts_id_and_trashold);
    // const number = await count_response_files_model()
    if (latest) {
      res.send(latest);
    }
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}

async function delete_results(req, res, next) {
  let error_message = "";

  const { checked_items } = req.query;

  console.log("items", checked_items);

  //  Checking whether there is no information in the deletion request
  if (!checked_items || checked_items.length === 0) {
    console.log("delete_results_by_ids no items to delete");
    return res.status(400).json({ message: "Choose items to delete them." });
  }
  // Checking whether one of the items that reach deletion is missing an ID or a file address for deletion
  const invalidItem = checked_items.find(
    (item) => !item.UniqueID || !item.ResponsePath
  );
  if (invalidItem != undefined) {
    console.log("invalidItem !!!");
    return res.status(400).json({
      message: `Missing data for delete results of ${invalidItem?.ModuleName} with the UniqueID of:  ${invalidItem?.UniqueID} `,
    });
  }

  try {
    for (const item of checked_items) {
      const tmpPath = "response_folder/tmp2.json";

      console.log("    item.ResponsePath ", item.ResponsePath);

      const exists = await Checking_if_file_exists_model(tmpPath);

      if (exists.success === true) {
        console.log("file exists");
      } else if (exists.success === false) {
        error_message = `respone path ${item.ResponsePath} not exists`;
        console.log("error_message", error_message);
      }

      console.log("exists1", exists.success === true);
      console.log("exists1", exists.success === false);

      //    const deleted =  await delete_json_results_file_model(item.ResponsePath );

      //  if (deleted?.success === true  ){console.log("yeaaaa", deleted?.message );}

      //  else {console.log("noooooooo", deleted)};
    }

    // Respond with a success message
    // res.status(200).json({ message: 'Results deleted successfully' });
  } catch (err) {
    console.error("Error deleting results:", err);
    res.status(500).send({
      success: false,
      error_message: error_message,
      catch_error_message:
        err.message || "An error occurred while deleting results",
    });
  }
}

async function ImportVeloResult(req, res, next) {
  try {
    console.log(
      req.body,
      req.body.PathOfFile,
      "ImportVeloResult ImportVeloResult ImportVeloResult ImportVeloResult ImportVeloResult s"
    );
    console.log(`File Uploaded successfully ${req.body?.fileName}`);
    res.send(true);

    const PYTHON_SCRIPTS_RELATIVE_PATH =
      process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const RELATIVE_PATH = path.resolve(__dirname, "..", "..");
    const PYTHON_SCRIPT_PATH = path.resolve(
      RELATIVE_PATH,
      PYTHON_SCRIPTS_RELATIVE_PATH,
      "modules",
      "Collector",
      "import_collection_file.py"
    );
    const Hostname = req.body?.fileName?.split("-r___r-")?.[1]?.split("_")?.[0];
    console.log(Hostname, "Hostname For Velociraptor Client");
    const command = `7z x "${req.body.FileZipPath}" -o"${req.body.FileFolder}"`;
    console.log("Command for Zip Assemble in velo upload: ", command);

    const response = await ImportVeloResultModal(command);
    console.log("response response response Zip :", response);

    if (response) {
      const command2 =
        "python " +
        PYTHON_SCRIPT_PATH +
        ` "${req.body.PathOfFile}" "${Hostname ? Hostname : "offline_host"}" "${
          req.body.FileFolder
        }"`;
      console.log("Command for Python in velo upload: ", command2);
      const response2 = await ImportVeloResultModal(command2);
      console.log(
        "response2 response2 response2 response2 response2 Velo Upload : ",
        response2
      );
      if (response2) {
        console.log("Velociraptor Upload Started");

        // res.send(true);
      } else {
        console.log("Error In Upload");

        // res.send("Error in Creating zip");
      }
    } else {
      console.log("Error in Zip Assemble");
      console.log(
        "req.body.FileFolder req.body.FileFolder ",
        req.body.FileFolder
      );

      // const del = await fs.rm(req.body.FileFolder,{recursive:true,force:true})
      // console.log(`Delete Folder Form ${req.body.FileFolder} `,del);

      // res.send(false);
    }
  } catch (error) {
    console.log("Error in ImportVeloResult");

    console.log(
      "req.body.FileFolder req.body.FileFolder ",
      req.body.FileFolder
    );
    res.status(400);
    // const del = await fs.rm(req.body.FileFolder,{recursive:true,force:true})
    // console.log(`Delete Folder Form ${req.body.FileFolder} `,del);
  }
}

async function GetRules(req, res, next) {
  const { id } = req.body;
  let file_name = "";
  console.log(req.body,"asdasdasdasdasda222222222222222222222222222");
  
  switch (id) {
    case "Yara":
      file_name = "response_folder/yara_rules.json";
      break;
    case "Nuclei":
      file_name = "response_folder/nuclei_rules.json";
      break;
    case "Sigma":
      file_name = "response_folder/sigma_rules.json";
      break;
  }
  console.log("get_single_velociraptor_response", file_name);

  try {
    const size = await check_file_size(file_name);

    //  const MB_limit = 0.022
    const MB_limit = 1;

    console.log("file size= ", size, "MB_limit= ", MB_limit);
    console.log(" MB_limit < size ", MB_limit < size);

    if (MB_limit < size) {
      console.log("json file too big", size);

      return res.status(200).json({
        success: false,
        fileSize: "Too big",
        mbSize: size,
        message: `File is too big. Maximum size allowed is ${MB_limit} MB.`,
      });
    } else {
      const result = await get_single_velociraptor_result_model(file_name);
      if (result) {
        return res.send(result);
      }
    }
  } catch (err) {
    res.send(err.message);
    next(err);
  }
}

module.exports = {
  GetRules,
  ImportVeloResult,
  // get_all_latest_results_dates,
  get_single_velociraptor_response,
  count_velociraptor_responses,
  check_last_req_and_res_for_module,
  get_all_requests_table,
  get_velociraptor_aggregate_macro,
  download_json_file,
  delete_results,
};
