const {
  getDefaultColumnsAndTables,
  get_All_Resources_model,
  get_All_Resources_model_Async,
  addResource_Website,
  delete_resource_Website,
} = require("../models/ResourcesModels");

const {
  make_toolData_model,
  make_JSON_Artifact_to_velociraptor,
  active_JSON_in_py,
  get_all_velociraptor_artifacts_model,
  make_JSON_Module_model,
  get_all_Modules_model,
  get_single_Module_by_id_model,
  write_last_run_of_module,
  change_positions,
  make_reponse_file_name,
  write_to_csv_table,
  get_Date_and_hour_string,
  enable_disable_module_model,
  show_in_ui_module_model,
  enable_disable_artifact_model,
} = require("../models/ToolsModels");

const {
  get_requests_csv_table_model,
  make_cool_object_from_csv_table,
} = require("../models/ResultsModels");

const { exec } = require("child_process");
const { writeFile } = require("fs");
const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");
const parser = new xml2js.Parser();
const DBConnection = require("../db.js");
const { v4: uuid } = require("uuid");
const { log } = require("console");

async function tmp1(req, res, next) {
  // const param1 =  req.query.param1
  console.log("  tmp1");
  try {
    const change_this = await DBConnection("tools")
      .where("tool_id", "2000000")
      .update({
        logoAddress_1: "./Logos/Velociraptor.svg",
        description_short: "Endpoint visibility and rapid response platform",
      });

    res.send("response");

    return { change_this };
  } catch (err) {
    console.log(err);
  }
}

// async function active_manual_process(req,res,next){
//   console.log("active_manual_process"  );
//   // const param1 =  req.query.param1
//  const isActive = await active_manual_process_model();

//   console.log("isActive" , isActive);
//   res.send(isActive)

//   }

async function change_modules_preview_position(req, res, next) {
  const type = req.body?.params?.type;
  const positionNumber = req.body?.params?.positionNumber;
  const operator = req.body?.params?.operator;
  const subtype = req.body?.params?.subtype;

  // console.log("type" , type);
  // console.log("positionNumber" , positionNumber);
  // console.log("operator" , operator);
  // console.log("subtype" , subtype);

  try {
    //                            await show_in_ui_module_model(module_id, set_ShowInUi_to)
    //     const enable_disable = await enable_disable_module_model(module_id, set_ShowInUi_to)

    if (type === "Module") {
      const all_Modules = await get_all_Modules_model();
      const new_positions = await change_positions(
        all_Modules,
        type,
        positionNumber,
        operator,
        subtype
      );

      if (new_positions === true) {
        res.send(true);
      } else {
        res.send(false);
      }
    } else if (type === "Artifact") {
      const all_artifacts = await get_all_velociraptor_artifacts_model();
      const new_positions = await change_positions(
        all_artifacts,
        type,
        positionNumber,
        operator,
        subtype
      );

      if (new_positions === true) {
        res.send(true);
      } else {
        res.send(false);
      }
    }

    // res.send(enable_disable)
  } catch (err) {
    console.log(err);
  }
}

async function show_in_ui_module(req, res, next) {
  const module_id = req.body?.params?.module_id;
  const set_ShowInUi_to = req.body?.params?.set_ShowInUi_to;
  console.log("module_id", module_id, "set_ShowInUi_to", set_ShowInUi_to);
  try {
    await show_in_ui_module_model(module_id, set_ShowInUi_to);
    const enable_disable = await enable_disable_module_model(
      module_id,
      set_ShowInUi_to
    );

    res.send(enable_disable);
  } catch (err) {
    console.log(err);
  }
}

async function enable_disable_module(req, res, next) {
  const module_id = req.body?.params?.module_id;
  const set_enable_disable_to = req.body?.params?.set_enable_disable_to;

  try {
    const enable_disable = await enable_disable_module_model(
      module_id,
      set_enable_disable_to
    );

    res.send(enable_disable);
  } catch (err) {
    console.log(err);
  }
}

async function enable_disable_artifact(req, res, next) {
  console.log("enable_disable_artifact");
  //  artifact_id: artifact_id ,
  //  set_enable_disable_to: !isActive,

  const artifact_id = req.body?.params?.artifact_id;
  const set_enable_disable_to = req.body?.params?.set_enable_disable_to;
  try {
    const enable_disable = await enable_disable_artifact_model(
      artifact_id,
      set_enable_disable_to
    );
    res.send(enable_disable);
  } catch (err) {
    console.log(err);
  }
}

async function Get_All_Tools(req, res, next) {
  try {
    const all_Modules = await get_all_Modules_model();
    res.send(all_Modules?.Modules);
  } catch (err) {
    console.log(err);
  }
}

async function get_all_velociraptor_artifacts(req, res, next) {
  try {
    const all_artifacts = await get_all_velociraptor_artifacts_model();
    if (all_artifacts) {
      res.send(all_artifacts?.allArtifacts);
    }
  } catch (err) {
    console.log(err);
  }
}

async function active_velocirapto_artifact(req, res, next) {
  // const checkedArtifacts = JSON.parse(req.query.checked_artifacts || '[]');
  const checkedArtifacts = req.query.checked_artifacts;

  //   const resourceList = JSON.parse(req.query.resource_list || '[]');

  if (
    checkedArtifacts.length === 0 ||
    checkedArtifacts === null ||
    checkedArtifacts === undefined
  ) {
    console.log("None of the Artifacts Checked");
    res.send("None of the Artifacts Checked");
    return;
  }

  // const TLSH = checkedArtifacts.includes('1000101')
  // const Zircolite = checkedArtifacts.includes('1000102')
  // const HardeningKitty = checkedArtifacts.includes('1000103')
  // const PersistenceSniper = checkedArtifacts.includes('1000104')

  // for (const artifact of checkedArtifacts) {

  // }

  // take care of kitty file
  for (const artifact of checkedArtifacts) {
    const { artifact_id, Toolname } = artifact;

    // console.log(artifact_id);

    const request_file_Path_and_Name = await make_JSON_Artifact_to_velociraptor(
      artifact_id
    );
    if (request_file_Path_and_Name) {
      const response = await active_JSON_in_py(request_file_Path_and_Name);

      res.send(response);
    }
  }
}

async function active_modules(req, res, next) {
  const Sub_Module = "";
  const module_id = req.query.module_id;
  const threshold_in_minutes = req.query.threshold_in_minutes;
  const examInnterval_minutes = req.query.examInnterval_minutes;

  const all_query = req.query;

  if (module_id === null || module_id === undefined || module_id === "") {
    res.send("module_id problem");
    return;
  } else if (
    threshold_in_minutes === null ||
    threshold_in_minutes === undefined ||
    threshold_in_minutes === ""
  ) {
    res.send("threshold problem");
    return;
  }

  const Module_info = await get_single_Module_by_id_model(module_id); // get info of the module from db

  const module_name = Module_info?.Tool_name;

  const Arguments = await make_toolData_model(module_id, all_query);

  const reponse_file_name = await make_reponse_file_name(
    module_id,
    module_name
  );

  const Start_Date = await get_Date_and_hour_string();
  console.log("threshold_in_minutes", threshold_in_minutes);
  const Expire_Date = await get_Date_and_hour_string(threshold_in_minutes);
  const filePath = await get_requests_csv_table_model();

  const the_orginal_file = await make_cool_object_from_csv_table(filePath);

  const write = await write_to_csv_table(
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
  );

  // const request_file_Path_and_Name = await make_JSON_Module_model(module_id,module_name, toolData)  // make the JSON FILE
  // console.log("popo -----------------5" , request_file_Path_and_Name);

  if (write === "good") {
    //  const response = await active_JSON_in_py(request_file_Path_and_Name)

    //  const write_last_run = await  write_last_run_of_module(module_id); /// write last run in db
    res.send("good");
  } else {
    res.send(write);
  }
}

module.exports = {
  Get_All_Tools,
  active_velocirapto_artifact,
  get_all_velociraptor_artifacts,
  active_modules,
  enable_disable_module,
  enable_disable_artifact,
  show_in_ui_module,
  change_modules_preview_position,
  tmp1,
};
