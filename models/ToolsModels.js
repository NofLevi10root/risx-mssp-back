// const DatabaseError = require('../errors/DatabaseError');
// const { log } = require('console');
//   const { exec } = require('child_process');
// const { log } = require('console');
// const { errorMonitor } = require('events');
// const parser2xml = new xml2js.Parser();
// const util = require('util');
// const xml2js = require('xml2js');
// const pathToTmpJson  = path.resolve(__dirname,'../tmpjsons/ResourceGroup-websites.json')

const fs = require("fs"); // Import 'fs' with Promise-based API
const fs_promises = require("fs").promises; // Import 'fs' with Promise-based API
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const path = require("path");
const DBConnection = require("../db.js");
const { spawn } = require("child_process");
const { log } = require("console");

// async function active_manual_process_model() {
//   console.log("active_manual_process_model");
//   try {
//       const EXECUTABLE = process.env.PYTHON_EXECUTABLE_ABSOLUTE;
//       const PYTHON_SCRIPTS_RELATIVE_PATH = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
//       const PYTHON_INTERVAL = process.env.PYTHON_INTERVAL;
//       const PYTHON_SCRIPT_PATH = path.resolve(__dirname, '..', '..', PYTHON_SCRIPTS_RELATIVE_PATH,PYTHON_INTERVAL);

//       return new Promise((resolve, reject) => {
//           const pythonProcess = spawn(EXECUTABLE, [PYTHON_SCRIPT_PATH]);

//           pythonProcess.stdout.on('data', (data) => {
//               console.log(`stdout: ${data.toString()}`);
//               // Assuming success based on some condition in the output
//               resolve(true);
//           });

//           pythonProcess.stderr.on('data', (data) => {
//               console.error(`stderr: ${data.toString()}`);
//               reject(false);
//           });

//           pythonProcess.on('close', (code) => {
//               if (code !== 0) {
//                   console.log(`Child process exited with code ${code}, indicating a failure.`);
//                   reject(false);
//               } else {
//                   resolve(true);
//               }
//           });
//       });

//   } catch (error) {
//       console.error(`Error occurred: ${error.message}`);
//       return false;
//   }
// }

// async function active_manual_process_model(){
//   console.log("active_main_process_model 1");
//   try {
//     const EXECUTABLE = process.env.PYTHON_EXECUTABLE_ABSOLUTE;
//     const PYTHON_MANUAL_ACTIVE_RELATIVE_PATH = process.env.PYTHON_MANUAL_ACTIVE_RELATIVE_PATH;
//     const PYTHON_SCRIPT_PATH = path.resolve(__dirname, '..', '..', PYTHON_MANUAL_ACTIVE_RELATIVE_PATH);
//     const pythonProcess = spawn(EXECUTABLE, [PYTHON_SCRIPT_PATH]);

//     pythonProcess.stdout.on('data', (data) => {
//         console.log(`stdout: ${data.toString()}`); return true;
//     });

//     pythonProcess.stderr.on('data', (data) => {
//         console.error(`stderr: ${data.toString()}`); return false;
//     });

//     pythonProcess.on('close', (code) => {
//         if (code !== 0) {
//             console.log(`Child process exited with code ${code}, indicating a failure.`); return false;
//         }
//     });

// } catch (error) {
//     console.error(`Error occurred: ${error.message}`); return false
// }

// }

async function show_in_ui_module_model(module_id, set_ShowInUi_to) {
  console.log("  module_id", module_id, "set_ShowInUi_to", set_ShowInUi_to);
  try {
    const change_this = await DBConnection("tools")
      .where("tool_id", module_id)
      .update("ShowInUi", set_ShowInUi_to);

    //     const Modules = await DBConnection('tools')
    //     .select('tool_id', 'ShowInUi');
    //         if (Modules)
    //  console.log(Modules);

    return { change_this };
  } catch (err) {
    console.log(err);
  }
}

async function enable_disable_module_model(module_id, set_enable_disable_to) {
  console.log(
    "  module_id",
    module_id,
    typeof module_id,
    "set_enable_disable_to",
    set_enable_disable_to,
    typeof set_enable_disable_to
  );
  try {
    const change_this = await DBConnection("tools")
      .where("tool_id", module_id)
      .update("isActive", set_enable_disable_to);

    //       const Modules = await DBConnection('tools')
    //       .select('tool_id', 'isActive');

    //  console.log(Modules);

    return { change_this };
  } catch (err) {
    console.log(err);
  }
}

async function enable_disable_artifact_model(
  artifact_id,
  set_enable_disable_to
) {
  console.log(
    "  artifact_id",
    artifact_id,
    typeof artifact_id,
    "set_enable_disable_to",
    set_enable_disable_to,
    typeof set_enable_disable_to
  );
  try {
    const change_this = await DBConnection("artifacts")
      .where("artifact_id", artifact_id)
      .update("isActive", set_enable_disable_to);

    return { change_this };
  } catch (err) {
    console.log(err);
  }
}

async function get_all_Modules_model() {
  try {
    const Modules = await DBConnection("tools").select("*");
    const [[tools]] = await DBConnection.raw(
      'SELECT JSON_EXTRACT(config, "$.Modules") as a FROM configjson'
    );
    for (let i = 0; i < Modules.length; i++) {
      const too = Modules[i];
      too.isActive = tools?.a?.[too?.Tool_name]?.Enable ?? false;
    }

    if (Modules) return { Modules };
  } catch (err) {
    console.log(err);
  }
}

async function get_single_Module_by_id_model(module_id) {
  console.log("dddddddddd", module_id);
  try {
    const Module = await DBConnection("tools")
      .select("*")
      .where("tool_id", "=", module_id);

    if (Module) return Module[0];
  } catch (err) {
    console.log(err);
  }
}

async function make_toolData_model(module_id, all_query) {
  console.log(
    "make_toolData_modelmake_toolData_modelmake_toolData_modelmake_toolData_modelmake_toolData_model"
  );
  let toolData = {};

  try {
    /// nuclei
    if (module_id === "2001005") {
      toolData = {
        nuclei_tags: "",
        nuclei_workflow: "",
        nuclei_exclude_severity: "",
        nuclei_targets: all_query.nuclei_targets,
      };
    }

    return toolData;
  } catch (err) {
    console.log(err);
    return "error in toolData";
  }
}

async function make_reponse_file_name(module_id, module_name) {
  try {
    const formattedDate = await get_Date_and_hour_string();
    const FileName = `response_${module_name.toLowerCase()}_${formattedDate}_module_id_${module_id}.json`;

    return FileName;
  } catch (err) {
    console.log("error in make_reponse_file_name", err);
  }
}

async function make_JSON_Module_model(module_id, module_name, toolData) {
  try {
    const formattedDate = await get_Date_and_hour_string();

    const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const directoryPath = path.join(__dirname, "..", "..", relativePath);

    // const directoryPath = path.join(__dirname, '..','..', 'risx-mssp-python-script','jsonexamples');

    const toolDataJSON = JSON.stringify(toolData);
    const FileName = `request_${module_name.toLowerCase()}_${formattedDate}_module_id_${module_id}.json`;

    const filePath = path.join(directoryPath, FileName);
    // console.log("filePath" , filePath);

    fs.writeFile(filePath, toolDataJSON, (err) => {
      if (err) {
        console.error("Error writing file:", err);
      } else {
        console.log("File written successfully");
      }
    });

    return filePath;
  } catch (err) {}
}

async function all_Modules_id_and_trashold() {
  try {
    const tools = await DBConnection("tools").select(
      "tool_id",
      "threshold_time",
      "Tool_name"
    );
    if (tools) return { tools };
  } catch (err) {
    console.log(err);
  }
}

async function all_Artifacts_id_and_trashold() {
  try {
    const artifacts = await DBConnection("artifacts").select(
      "artifact_id",
      "threshold_time",
      "Toolname"
    );
    if (artifacts) return { artifacts };
  } catch (err) {
    console.log(err);
  }
}

async function get_all_velociraptor_artifacts_model() {
  try {
    const allArtifacts = await DBConnection("artifacts").select("*");
    const [[tools]] = await DBConnection.raw(
      'SELECT JSON_EXTRACT(config, "$.Modules.Velociraptor.SubModules") as a FROM configjson'
    );
    for (let i = 0; i < allArtifacts.length; i++) {
      const too = allArtifacts[i];
      too.isActive = tools?.a?.[too?.Toolname]?.Enable ?? false;
    }
    console.log(
      allArtifacts,
      "allArtifacts allArtifacts allArtifacts allArtifacts allArtifacts allArtifacts allArtifacts"
    );
    if (allArtifacts) return { allArtifacts };
  } catch (err) {
    console.log(err);
  }
}

function get_Artifact_path_config_file() {
  const configFileName = `artifact_config.json`;

  console.log("NODE_ENV production--or--development-:::", process.env.NODE_ENV);

  // let directory;
  let path_to_config;

  if (process.env.NODE_ENV === "development") {
    path_to_config = path.join(
      __dirname,
      "..",
      "..",
      "risx-mssp-front",
      `public`,
      configFileName
    );
    return path_to_config;
  } else if (process.env.NODE_ENV === "production") {
    path_to_config = path.join(
      __dirname,
      "..",
      "..",
      "risx-mssp-front-build",
      configFileName
    );
    return path_to_config;
  }

  // const dev_mode = `public`;
  // const path_for_dev = path.join(__dirname, '..', '..', directory, dev_mode, configFileName);
  // const path_for_dev = path.join(__dirname, '..', '..', directory, `public`, configFileName);

  // const path_for_client = path.join(__dirname, '..', '..', directory, configFileName);
  // let path_to_artifact_config = "";

  // try {
  //   if (fs.existsSync(path_for_dev)) {
  //     return path_for_dev;

  // } else if (fs.existsSync(path_for_client)) {
  //   return path_for_client;
  // }

  // } catch (err) {
  //     console.error('Error:', err);
  //     return null; // Return null in case of error
  // }
}

async function read_All_Artifacts_config_file(Artifact_path_config_file) {
  try {
    const data = await fs_promises.readFile(Artifact_path_config_file, "utf8");
    const jsonData = JSON.parse(data);

    return jsonData;
  } catch (err) {
    console.error("Error reading file:", err);
    throw err; // Rethrow the error
  }
}

async function read_Artifact_config(Artifact_config_file, artifact_id) {
  const find_this_id = artifact_id;
  try {
    const artifact_item_json = Artifact_config_file.find(
      (item) => item.artifact_id === find_this_id
    );
    // console.log("artifact_item_json" , artifact_item_json);
    const { comments, artifact_id, ...rest } = artifact_item_json;
    // Create a modified object without 'comments' and 'artifact_id'
    const modifiedData = { ...rest };
    return modifiedData;

    return;
  } catch (err) {
    console.error("Error read_Artifact_config  :", err);
    throw err; // Rethrow the error
  }
}

async function make_JSON_Artifact_to_velociraptor(artifact_id) {
  let toolData = {};
  const Artifact_path_config_file = await get_Artifact_path_config_file();
  const Artifact_config_file = await read_All_Artifacts_config_file(
    Artifact_path_config_file
  );
  const Artifact_config = await read_Artifact_config(
    Artifact_config_file,
    artifact_id
  );

  if (Artifact_config) {
    (toolData = Artifact_config),
      console.log("Artifact_config 00000", Artifact_config);
  }

  console.log("6666666666666666666666666666666666", Artifact_config);

  // //   try {
  // // ///  HardeningKitty
  // if (artifact_id === '1000103'){
  //     toolData = {
  //     action: "runartifact",
  //     artifactname: "Exchange.Windows.HardeningKitty",
  //     arguments: "TakeBackUp= 'N', Baseline= 'finding_list_0x6d69636b_machine'",
  //     expiretime: "70",
  //     organizationid: "OCHL0",
  //     label: "iris"
  // }
  // }
  // ///Zircolite
  // else if (artifact_id === '1000102'){
  //   toolData = {
  //   action: "runartifact",
  //   artifactname: "Exchange.Windows.EventLogs.Zircolite",
  //   arguments: "EVTXPath= 'C:\\Windows\\System32\\winevt\\Logs', Rules= 'https://raw.githubusercontent.com/wagga40/Zircolite/master/rules/rules_windows_generic.json', Mappings= 'https://raw.githubusercontent.com/wagga40/Zircolite/master/config/fieldMappings.json'",
  //   expiretime: "120",
  //   organizationid: "OCHL0",
  //   label: "iris"
  // }
  // }
  //  ///Persistence Sniper
  // else if (artifact_id === '1000104'){
  //   toolData = {
  //   action: "runartifact",
  //   artifactname: "Exchange.Windows.PersistenceSniper",
  //   arguments: "",
  //   expiretime: "120",
  //   organizationid: "OCHL0",
  //   label: "iris"
  // }

  //  ///Hayabusa
  // }
  // else if (artifact_id === '1000105'){
  //   toolData = {
  //   action: "runartifact",
  //   artifactname: "Exchange.Windows.EventLogs.Hayabusa",
  //   arguments: "UTC= 'Y', UpdateRules= 'Y', NoisyRules= 'N', OutputProfile= 'standard', EIDFilter= 'N', MinimalLevel='informational', Threads= '2'",
  //   expiretime: "1200",
  //   organizationid: "OCHL0",
  //   label: "iris"
  // }

  // }

  const formattedDate = await get_Date_and_hour_string();

  const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
  const directoryPath = path.join(__dirname, "..", "..", relativePath);

  // // const directoryPath = path.join(__dirname, '..','..', 'risx-mssp-python-script','jsonexamples');

  const toolDataJSON = JSON.stringify(toolData);
  const FileName = `request_velociraptor_${formattedDate}_artifact_id_${artifact_id}.json`;
  console.log("toolDataJSON", toolDataJSON);
  const filePath = path.join(directoryPath, FileName);
  //   // console.log("filePath" , filePath);

  fs.writeFile(filePath, toolDataJSON, (err) => {
    if (err) {
      // Handle possible errors in file writing
      console.error("Error writing file:", err);
    } else {
      console.log("File written successfully");
    }
  });

  return filePath;
  //   } catch (err) {

  //   }
}

async function get_Date_and_hour_string(additionalMinutes = 0) {
  try {
    const date = new Date();
    date.setTime(date.getTime() + additionalMinutes * 60000); // Convert minutes to milliseconds and add to current time
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // getMonth() is zero-based
    const year = String(date.getFullYear()).slice(2); // Get the last two digits of the year
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const formattedDate = `${day}-${month}-${year}-${hours}-${minutes}-${seconds}`;
    return formattedDate;
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function active_JSON_in_py(request_file_Path_and_Name) {
  const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE;
  const PYTHON_EXECUTABLE_RELATVE = path.resolve(
    __dirname,
    "..",
    "..",
    PYTHON_EXECUTABLE
  );

  // const EXECUTABLE = process.env.PYTHON_EXECUTABLE_ABSOLUTE

  // const SCRIPT_PATH = process.env.PYTHON_VELOCIRAPTOR_SCRIPT_PATH

  const PYTHON_SCRIPTS_RELATIVE_PATH =
    process.env.PYTHON_SCRIPTS_RELATIVE_PATH + process.env.PYTHON_INTERVAL;
  const SCRIPT_RELATIE_PATH = path.join(
    __dirname,
    "..",
    "..",
    PYTHON_SCRIPTS_RELATIVE_PATH
  );

  // console.log("111111",SCRIPT_PATH);
  console.log("222222", SCRIPT_RELATIE_PATH);

  // const directoryPath2 = path.join(__dirname );
  // console.log("11111111111111",directoryPath1);
  // console.log("22222222222222",directoryPath2);
  try {
    // Spawn the Python process
    const pythonProcess = spawn(PYTHON_EXECUTABLE_RELATVE, [
      "-u",
      SCRIPT_RELATIE_PATH,
      request_file_Path_and_Name,
    ]);

    const response_file_Path_and_Name = request_file_Path_and_Name.replace(
      "request",
      "response"
    );

    // Handle real-time stdout data
    pythonProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data.toString()}`);
      return true;
    });

    // Handle real-time stderr data
    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data.toString()}`);
      const noData = "No data collected";
      const res = data?.toString();
      if (res.includes(noData)) {
        return false;
      }
    });

    // Handle process exit
    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.log(
          `Child process exited with code ${code}, indicating a failure.`
        );
      }
      return true;
      // else  if (code == 0) {
      //   console.log(`לך חפש תקובץ`);
      //   if (err) {   console.log(err); return }

      //   try{

      //   }
      //   catch(err){console.log(err);return err}

      //  fs.readFile(response_file_Path_and_Name, 'utf8', function(err, data){
      //   if(err){console.log(err);return err}
      // const json_response_of_artifact  =  JSON.parse(data)
      // return json_response_of_artifact

      // }
      // );

      // }
    });
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
  }
}

async function write_last_run_of_module(module_id) {
  console.log(module_id, "write_last_run_of_module");
  try {
    const newDate = new Date();
    const write = await DBConnection("tools")
      .where({ tool_id: module_id })
      .update({
        LastRun: newDate, // Updating 'date_last_run' to the new date
      });
    console.log(write); // This will log the number of rows updated
  } catch (err) {
    // const put = await DBConnection('all_resources').where({resource_id:resource_id})
    // .update({

    //   resource_string:  req.body?.resource_string,
    //   type:item_types_list.toString(),
    //   tools: item_tool_list.toString(),
    //   description: description,
    //   monitoring: monitoring
    // });
    console.log(err);
    return err;
  }
}
async function write_to_csv_table(
  filePath,
  the_orginal_file,
  module_name,
  Sub_Module,
  Start_Date,
  Expire_Date,
  examInnterval_minutes,
  Arguments,
  reponse_file_name,
  module_id
) {
  console.log(
    "write_to_csv_table 33333333333333333333333",
    the_orginal_file[0]
  );
  const headrs = Object.keys(the_orginal_file[0]).map((a) => {
    return { id: a, title: a };
  });

  try {
    const csvWriter = createCsvWriter({
      // path: 'path/to/file.csv',
      path: filePath,
      header: headrs,
      append: true,
    });

    // const argumentsString = JSON.stringify(Arguments);
    // console.log("ssssssssssssssssssssssssssssssssss",argumentsString);

    const records = [
      {
        Module_Name: module_name,
        Sub_Module: "",
        Start_Date: Start_Date,
        Expire_Date: Expire_Date,
        Last_Interval_Date: Start_Date,
        Time_Interval: examInnterval_minutes,
        Arguments: await JSON.stringify(Arguments),
        Status: "Request",
        Response_Path: reponse_file_name,
        Module_ID: module_id,
      },
    ];

    csvWriter
      .writeRecords(records) // returns a promise
      .then(() => {
        console.log("...Done");
      });

    return "good";
  } catch (err) {
    console.error("Error createCsvWriter file:", err);
    return "Error createCsvWriter file";
  }
}

async function change_positions(
  all_Modules_or_Artifact,
  type,
  positionNumber,
  operator,
  subtype
) {
  let all_list_same_type;

  try {
    if (type === "Module") {
      all_list_same_type = await all_Modules_or_Artifact?.Modules.filter(
        (item) => item?.toolType === subtype && item?.BoxType != "Velociraptor"
      );
    } else if (type === "Artifact") {
      all_list_same_type = await all_Modules_or_Artifact?.allArtifacts.filter(
        (item) => item?.BoxType != "Velociraptor"
      );
    }

    //  console.log("all_list_same_type" , all_list_same_type);

    if (!all_list_same_type) {
      return;
    }
    const [the_item] = await all_list_same_type.filter(
      (item) => item?.positionNumber === positionNumber
    );
    const [the_item_above] = await all_list_same_type.filter(
      (item) =>
        item?.positionNumber === the_item?.positionNumber - 1 &&
        item?.BoxType != "Velociraptor"
    );
    const [the_item_below] = await all_list_same_type.filter(
      (item) =>
        item?.positionNumber === the_item?.positionNumber + 1 &&
        item?.BoxType != "Velociraptor"
    );

    let table_name;
    let artifact_id_or_module_id;

    switch (type) {
      case "Artifact":
        table_name = "artifacts";
        artifact_id_or_module_id = "artifact_id";
        break;
      case "Module":
        table_name = "tools";
        artifact_id_or_module_id = "tool_id";
        break;

      default:
        throw new Error("Invalid type");
    }

    console.log("the_item_above  ---  ", the_item_above?.Tool_name);
    console.log("the_item        ---  ", the_item?.Tool_name);
    console.log("the_item_below  ---  ", the_item_below?.Tool_name);

    console.log("type", type); //Module   //Artifact

    if (the_item?.positionNumber === 1 && operator === -1) {
      console.log("its on top..  cant move up");
      return;
    }
    if (
      the_item?.positionNumber === all_list_same_type?.length &&
      operator === +1
    ) {
      console.log("its on buttom.. cant move down");
      return;
    }

    console.log(
      "999 item 33333333333",
      artifact_id_or_module_id,
      table_name === "artifacts" ? the_item?.artifact_id : the_item?.tool_id
    );

    if (operator === -1) {
      ///go up

      console.log(
        "change item ",
        the_item?.Tool_name,
        " number from ",
        the_item.positionNumber,
        "to ",
        the_item.positionNumber - 1
      );

      await DBConnection(table_name)
        .where(
          artifact_id_or_module_id,
          table_name === "artifacts" ? the_item?.artifact_id : the_item?.tool_id
        )
        .update("positionNumber", the_item.positionNumber - 1);

      console.log(
        "change above ",
        the_item_above?.Tool_name,
        " number from ",
        the_item_above.positionNumber,
        "to ",
        the_item_above.positionNumber + 1
      );

      await DBConnection(table_name)
        .where(
          artifact_id_or_module_id,
          table_name === "artifacts"
            ? the_item_above?.artifact_id
            : the_item_above?.tool_id
        )
        .update("positionNumber", the_item_above.positionNumber + 1);
    }

    if (operator === +1) {
      ///go down
      console.log(
        "change item ",
        the_item?.Tool_name,
        " number from ",
        the_item.positionNumber,
        "to ",
        the_item.positionNumber + 1
      );
      await DBConnection(table_name)
        .where(
          artifact_id_or_module_id,
          table_name === "artifacts" ? the_item?.artifact_id : the_item?.tool_id
        )
        .update("positionNumber", the_item.positionNumber + 1);

      console.log(
        "change below ",
        the_item_below?.Tool_name,
        " number from ",
        the_item_below.positionNumber,
        "to ",
        the_item_below.positionNumber - 1
      );

      await DBConnection(table_name)
        .where(
          artifact_id_or_module_id,
          table_name === "artifacts"
            ? the_item_below?.artifact_id
            : the_item_below?.tool_id
        )
        .update("positionNumber", the_item_below.positionNumber - 1);
    }

    return true;
  } catch (err) {
    console.log(err);
  }
}

async function GetAllTNA() {
  try {
    const [to] = await DBConnection.raw(
      'SELECT Tool_name as name,JSON_EXTRACT(arguments, "$.tags") as tags FROM tools'
    );
    const [Art] = await DBConnection.raw(
      'SELECT Toolname as name,JSON_EXTRACT(arguments, "$.tags") as tags FROM artifacts'
    );
    return [...Art, ...to];
  } catch (err) {
    console.log(err);
    return err;
  }
}

async function UpdateAllTNA(list) {
  try {
    console.log(`update tools set isActive = Tool_Name in ("${list}")`);
    console.log(`update artifacts set isActive = Toolname in ("${list}")`);

    const [to] = await DBConnection.raw(
      `update tools set isActive = Tool_Name in ("${list}")`
    );
    const [Art] = await DBConnection.raw(
      `update artifacts set isActive = Toolname in ("${list}")`
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = {
  UpdateAllTNA,
  GetAllTNA,
  change_positions,
  make_JSON_Artifact_to_velociraptor,
  get_Date_and_hour_string,
  active_JSON_in_py,
  get_all_velociraptor_artifacts_model,
  make_JSON_Module_model,
  get_all_Modules_model,
  get_single_Module_by_id_model,
  make_toolData_model,
  write_last_run_of_module,
  all_Modules_id_and_trashold,
  all_Artifacts_id_and_trashold,
  make_reponse_file_name,
  write_to_csv_table,
  enable_disable_module_model,
  enable_disable_artifact_model,
  show_in_ui_module_model,
  // active_manual_process_model
};
