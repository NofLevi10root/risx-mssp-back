const { error } = require("ajv/dist/vocabularies/applicator/dependencies.js");
const DBConnection = require("../db.js");
const { DiscrError } = require("ajv/dist/vocabularies/discriminator/types.js");
const { exec } = require("child_process");
const config_table = "configjson";
const fs = require("fs");
const fs_promises = require("fs").promises; // Import 'fs' with Promise-based API
const path = require("path");
const { spawn } = require("child_process");
const config_column = "config";

async function put_full_config_model(config) {
  console.log("put_full_config_model");

  if (config === undefined || config === null) {
    console.log("config file is,", config);
    return "Error in Put config file";
  }

  try {
    const stringified = JSON.stringify(config);
    const change_this = await DBConnection(config_table)
      .update({ config: stringified })
      .limit(1); //   first row
    console.log("change_this sssssssss", change_this);

    try {
      const rePutAssets = await DBConnection.raw("call addAllAssetsToConfig()");
      console.log(rePutAssets);
    } catch (error) {
      console.log("error", error);
      await DBConnection.raw("call addAllAssetsToConfig()");
    }

    // const stringified =  JSON.stringify( real_config)
    //     const change_this = await DBConnection('configjson')
    //     .update({ config:stringified})
    //     .limit(1); //   first row
    //  console.log(change_this);

    // const [Nuclei] = await DBConnection.raw('SELECT JSON_EXTRACT(config,"$.Modules.Nuclei") as data FROM configjson;');
    // console.log("ddddssssssssssssssssss Nuclei"  , Nuclei[0].data);
    // const [ReqestStatus] = await DBConnection.raw('SELECT JSON_EXTRACT(config,"$.ReqestStatus") as data FROM configjson;');
    //  console.log("ReqestStatus ReqestStatus"  , ReqestStatus[0] );

    return change_this;
  } catch (err) {
    const error_m = {
      error: "failed saving config",
      DiscrError: [err],
    };
    console.error("Error find get_full_config_model:", err);
    return error_m;
  }
}

async function get_full_config_model() {
  try {
    const [the_config_json] = await DBConnection(config_table).select(
      config_column
    );

    // console.log("the_config_json  "  , the_config_json);
    // console.log("the_config_json  "  , the_config_json.config.Modules.Nuclei);
    // const [Nuclei] = await DBConnection.raw('SELECT JSON_EXTRACT(config,"$.Modules.Nuclei") as data FROM configjson;');
    // console.log("ddddssssssssssssssssss Nuclei"  , Nuclei[0].data);

    // const [ReqestStatus] = await DBConnection.raw('SELECT JSON_EXTRACT(config,"$.ReqestStatus") as data FROM configjson;');
    //  console.log("ReqestStatus ReqestStatus"  , ReqestStatus[0] );

    return the_config_json.config;
  } catch (err) {
    const error_m = {
      error: "Error find get_full_config_model",
      DiscrError: [err],
    };
    console.error("Error find get_full_config_model:", err);
    return error_m;
  }
}

async function Update_mssp_config_json_links_model(body) {
  if (!body) {
    console.log("config file is,", body);
    return "Error in Put body file: Body is undefined or null";
  }

  try {
    let path_to_mssp_config_json = "";
    const mssp_config_json = "mssp_config.json";

    if (process.env.NODE_ENV === "development") {
      path_to_mssp_config_json = path.join(
        __dirname,
        "..",
        "..",
        "risx-mssp-front",
        `public`,
        mssp_config_json
      );
    } else if (process.env.NODE_ENV === "production") {
      path_to_mssp_config_json = "/frontend/mssp_config.json";
    }

    if (!path_to_mssp_config_json) {
      console.error("Path to mssp_config.json is undefined.");
      return "Error: Path to mssp_config.json is undefined.";
    }

    const data = await fs_promises.readFile(path_to_mssp_config_json, "utf8");

    const config = JSON.parse(data);
    // Update moduleLinks in the config object
    config.moduleLinks = body;

    // Write the updated JSON back to mssp_config.json
    await fs_promises.writeFile(
      path_to_mssp_config_json,
      JSON.stringify(config, null, 2)
    );
    console.log("mssp_config.json updated successfully.");

    return true;
  } catch (error) {
    console.error("Error updating mssp_config.json:", error);
    return false;
  }
}
async function GetAssetsModal() {
  try {
    const [fileM] = await DBConnection.raw(
      "SELECT resource_string,tools,description,type,monitoring,checked FROM all_resources;"
    );
    return fileM;
  } catch (err) {
    console.log("Error in getAssetsModal ", err);
    return { error: "Error in Export" };
  }
}

async function PostImportedAssets(entities, assets) {
  try {
    // console.log(entities, assets, "entities, assets");

    if (assets.length > 0) {
      const fileA = await DBConnection("all_resources").insert(assets);
      console.log(fileA, "fileA PostImportedAssets");
    }
    if (entities.length > 0) {
      const fileE = await DBConnection("entities").insert(entities);
      console.log(fileE, "fileE PostImportedAssets");
    }

    return true;
  } catch (err) {
    console.log("Error in PostImportedAssets ", err);
    return { error: "Error in Export" };
  }
}

async function GetAllVeloConfigModel() {
  try {
    console.log("start GetAllVeloConfigModel");
    const [fileA] = await DBConnection.raw(
      "SELECT * FROM on_premise_velociraptor"
    );
    return fileA;
  } catch (error) {
    console.log("Error in GetAllVeloConfigModel", error);
  }
}

async function SaveConfigVeloModel(obj) {
  try {
    console.log("start SaveConfigVeloModel");
    const fileA = await DBConnection("on_premise_velociraptor")
      .where({
        config_id: obj?.config_id,
      })
      .update({
        config_name: obj.config_name,
        description: obj.description,
        config: JSON.stringify(obj.config),
      });
    console.log(fileA);
    return true;
  } catch (error) {
    console.log("Error in SaveConfigVeloModel", error);
    return false;
  }
}

async function AddConfigVeloModel(obj) {
  try {
    console.log("start AddConfigVeloModel");
    const fileA = await DBConnection("on_premise_velociraptor").insert({
      config_name: obj.config_name,
      description: obj.description,
      config: JSON.stringify(obj.config),
    });
    console.log(fileA);
    return true;
  } catch (error) {
    console.log("Error in AddConfigVeloModel", error);
    return false;
  }
}
async function GetAllVeloConfigSideBarModel() {
  try {
    console.log("start GetAllVeloConfigModel");
    const [fileA] = await DBConnection.raw(
      "SELECT config_id, config_name FROM on_premise_velociraptor"
    );
    return fileA;
  } catch (error) {
    console.log("Error in GetAllVeloConfigModel", error);
  }
}

async function GetISTimeSketchRun() {
  try {
    console.log("start GetISTimeSketchRun");
    const [[the_config_json]] = await DBConnection.raw(
      'SELECT JSON_EXTRACT(config,"$.Modules.TimeSketch.Enable") as a FROM configjson'
    );
    return the_config_json.a;
  } catch (error) {
    console.error("Error in GetISTimeSketchRun", error);
  }
}

async function GetSpecificCollectorModal(command) {
  try {
    console.log("start GetSpecificCollectorModal");
    return new Promise((resolve, reject) => {
      try {
        exec(command, { shell: "/bin/bash" }, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing command: ${error.message}`);
            // reject(false);
            // return;
          }

          if (stderr) {
            console.error(`Error: ${stderr}`);
            // reject(false);
            // return;
          }

          // Check if any line contains the file name
          const lines = stdout?.trim()?.split("\n");

          const filePathResolveStuff = lines[lines.length - 1]
            ?.split("cut")[1]
            ?.trim();
          console.log(
            "filePathResolveStuff filePathResolveStuff filePathResolveStuff ",
            filePathResolveStuff
          );

          resolve(filePathResolveStuff);
        });
      } catch (error) {
        console.log("Error in exec GetSpecificCollectorModal ", error);
      }
    });
  } catch (error) {
    console.log("Error  in GetSpecificCollectorModal", error);
  }
}

async function GetAgentLinks() {
  try {
    const [[the_config_json]] = await DBConnection.raw(
      'SELECT JSON_EXTRACT(config,"$.General.AgentLinks.Linux") as a FROM configjson'
    );
    console.log(
      the_config_json.a,
      "the_config_json the_config_json the_config_json the_config_json"
    );

    return the_config_json.a;
  } catch (err) {
    const error_m = {
      error: "Error find GetAgentLinks",
      DiscrError: [err],
    };
    console.error("Error find GetAgentLinks:", err);
    return error_m;
  }
}

async function StartExecProcessVeloDisk(cmd1, cmd2) {
  try {
    const cmd1Run = () => {
      return new Promise((resolve, reject) => {
        try {
          exec(cmd1, { shell: "/bin/bash" }, (error, stdout, stderr) => {
            if (error) {
              console.error(`Error executing command 1: ${error.message}`);
              // reject(false);
              // return;
            }

            if (stderr) {
              console.error(`Error: ${stderr}`);
              // reject(false);
              resolve(false);
              return;
            }
            console.log(stdout);

            resolve(true);
          });
        } catch (error) {
          console.log("Error in exec GetSpecificCollectorModal ", error);
        }
      });
    };
    const RunCmd1 = await cmd1Run();
    console.log("asdasdasdasdasdasdasdasdasdasdasdasdsa run command 1 end");

    return true;
  } catch (err) {
    const error_m = {
      error: "Error find StartExecProcessVeloDisk",
      DiscrError: [err],
    };
    console.error("Error find StartExecProcessVeloDisk:", err);
    return error_m;
  }
}

async function BringSpecificConfigModal(name, bool) {
  try {
    if (bool) {
      const [[the_config_json]] = await DBConnection.raw(
        `SELECT JSON_EXTRACT(config,'$.Modules.Velociraptor.SubModules.${name}') as a FROM configjson`
      );
      return the_config_json.a;
    }
    const [[the_config_json]] = await DBConnection.raw(
      `SELECT JSON_EXTRACT(config,"$.Modules.${name}") as a FROM configjson`
    );
    console.log(
      the_config_json.a,
      "the_config_json the_config_json the_config_json the_config_json"
    );

    return the_config_json.a;
  } catch (err) {
    const error_m = {
      error: "Error find BringSpecificConfigModal",
      DiscrError: [err],
    };
    console.error("Error find BringSpecificConfigModal:", err);
    return error_m;
  }
}

async function SaveSpecificConfigModal(name, bool, cho) {
  try {
    if (bool) {
      const the_config_json = await DBConnection.raw(
        `UPDATE configjson SET config = JSON_SET(config,'$.Modules.Velociraptor.SubModules.${name}',cast( '${JSON.stringify(
          cho
        )}' as json)),lastupdated = now()`
      );
      return true;
    }
    const the_config_json = await DBConnection.raw(
      `UPDATE configjson SET config = JSON_SET(config,'$.Modules.${name}',cast( '${JSON.stringify(
        cho
      )}' as json)),lastupdated = now()`
    );
    console.log(
      the_config_json.a,
      "the_config_json the_config_json the_config_json the_config_json"
    );

    return true;
  } catch (err) {
    const error_m = {
      error: "Error find SaveSpecificConfig",
      DiscrError: [err],
    };
    console.error("Error find SaveSpecificConfig:", err);
    return false;
  }
}

module.exports = {
  SaveSpecificConfigModal,
  BringSpecificConfigModal,
  StartExecProcessVeloDisk,
  GetAgentLinks,
  GetAllVeloConfigSideBarModel,
  GetSpecificCollectorModal,
  AddConfigVeloModel,
  SaveConfigVeloModel,
  get_full_config_model,
  put_full_config_model,
  Update_mssp_config_json_links_model,
  GetAssetsModal,
  PostImportedAssets,
  GetAllVeloConfigModel,
  GetISTimeSketchRun,
};
