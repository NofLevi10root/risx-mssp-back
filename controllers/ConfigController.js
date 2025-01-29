const {
  get_full_config_model,
  put_full_config_model,
  Update_mssp_config_json_links_model,
  GetAssetsModal,
  PostImportedAssets,
  GetAllVeloConfigModel,
  SaveConfigVeloModel,
  AddConfigVeloModel,
  GetAllVeloConfigSideBarModel,
  GetSpecificCollectorModal,
} = require("../models/ConfigModels");
const DBConnection = require("../db.js");
const fs = require("fs"); // Import 'fs' with Promise-based API
const path = require("path");
const os = require("os");
const axios = require("axios");
const { v4: uuid } = require("uuid");
const {
  getFullCategoryAndEntitiesListModal,
  GetAllEntitiesAndAssetsModal,
} = require("../models/ResourcesModels.js");

async function Get_Config(req, res, next) {
  try {
    const file = await get_full_config_model();
    res.send(file);
  } catch (err) {
    console.log(err);
  }
}

async function Put_Config(req, res, next) {
  const config = req.body?.config;

  try {
    const put = await put_full_config_model(config);
    console.log("put", put);

    if (put === 1) {
      res.status(200).send("Updated successfully");
    } else {
      res.status(500).send("Internal Server Error");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}

async function Get_From_ENV(req, res, next) {
  let data = {
    FRONT_IP: "",
    FRONT_URL: "",
    other: "",
  };

  try {
    const FRONT_IP = process.env.FRONT_IP;
    const FRONT_URL = process.env.FRONT_URL;

    data = {
      FRONT_IP: FRONT_IP,
      FRONT_URL: FRONT_URL,
      other: "",
    };

    res.send(data);
  } catch (err) {
    console.log(err);
  }
}

async function Update_mssp_config_json_links(req, res, next) {
  const body = req.body;
  if (body === undefined) {
    console.log("Update_mssp_config_json_links", body);
    return;
  }

  try {
    const put = await Update_mssp_config_json_links_model(body);
    if (put === true) {
      res.status(200).send("mssp_config.json updated successfully.");
    } else {
      res.status(500).send("Error updating mssp_config.json:");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
}

const ResetConfigToBasic = async (req, res, next) => {
  console.log("ResetConfigToBasic boom");
  const filePath = path.join(
    __dirname,
    "..",
    "db",
    "seeds",
    "production",
    "config_seed.json"
  );
  console.log("filePath 55555", filePath);

  const BasicConfig = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log("BasicConfig 8893852", BasicConfig);

  const put = await put_full_config_model(BasicConfig);

  if (put === 1) {
    res.status(200).send("Updated successfully");
  } else {
    res.status(500).send("Internal Server Error");
  }
};

async function DownloadAgent(req, res, next) {
  console.log("req.body req.body req.body", req?.body);
  const { PathOs } = req?.body;
  // console.log(os.homedir()+"\\setup_platform\\scripts\\velociraptor-docker\\velociraptor\\client\\windows\\velociraptor_client.msi");
  const url = PathOs.replace("~", os.homedir());
  console.log(url);
  const exist = await fs.existsSync(url);
  console.log(
    "does file exist  0.8.1",
    exist,
    "ooooooooooooooooooooooooooooooooossssssssssssssssssssssssss"
  );
  if (exist) {
    res.download(url);
  } else {
    res.status(401).send({ error: "no such file" });
  }
}
async function GetAllLeakAsset(req, res, next) {
  // Work in progress
  const data = await DBConnection.raw(
    'SELECT resource_string FROM all_resources where tools like "%2001009%" or tools like "%2001011%"'
  );
  console.log("leakCheck Assets data", data);
  // res.send(data[0].map((x) => x.resource_string));

  const LeakJson = await axios.get(
    // "https://leakcheck.io/api/v2/query/"+data[0].map((x) => x.resource_string).join(", "),
    "https://leakcheck.io/api/v2/query/example@example.com",
    {
      headers: {
        Accept: "application/json",
        "X-API-Key": "d1ade9ae7283d9ed377a54718b9cd1d770cb3f49",
      },
    }
  );
  console.log("gggggggggggggggg", LeakJson);
}

async function ExportAllAssets(req, res, next) {
  try {
    console.log("start ExportAllAssets");
    const file = await GetAllEntitiesAndAssetsModal();
    // const file = await getFullCategoryAndEntitiesListModal();

    console.log(file, "End ExportAllAssets");

    res.send(file);
  } catch (err) {
    console.log("Error in ExportAllAssets ", err);
  }
}

async function ImportAllAssets(req, res, next) {
  try {
    console.log("start ImportAllAssets");
    // console.log(
    //   "ttttttttttttttttttttttttttttttttttttttttttttttttttttt",
    //   req.body
    // );
    const file = await GetAllEntitiesAndAssetsModal();
    const EntitiesRaw = req.body[0];
    const AssetsRaw = req.body[1];

    const EntitiesFilter = EntitiesRaw.filter((y) => {
      let bol = true;
      file[0]?.forEach((t) => {
        if (y.entities_id == t.entities_id) {
          bol = false;
          console.log("Already Exists ", y.entities_id);
        }
      });
      return bol;
    });

    const AssetsFilter = AssetsRaw.filter((y) => {
      let bol = true;
      file[1].forEach((t) => {
        if (y.resource_string == t.resource_string && y.type == t.type) {
          bol = false;
          console.log("Already Exists ", y.resource_string);
        }
      });
      return bol;
    }).map((x) => {
      const id = uuid();
      const id_short = id.replace(/-/g, "").substring(0, 9);
      const id_with_r = "r" + id_short;
      x.resource_id = id_with_r;
      return x;
    });
    console.log();
    if (EntitiesFilter.length > 0 || AssetsFilter.length > 0) {
      const r = await PostImportedAssets(EntitiesFilter, AssetsFilter);
      console.log(r, "response of import");
      // להיתבסס על הטקסט
      res.send("Added successfully");
    } else {
      console.log("Nothing To add As It Already Exists in the Db");

      res.send("Nothing To add As It Already Exists in the Db");
    }
    console.log("End ImportAllAssets");
  } catch (err) {
    console.log("Error in import assets ", err);
    res.send("Error");
  }
}

async function DeleteResultHistory(req, res, next) {
  try {
    console.log("start");
    const file = await get_full_config_model();
    file.RequestStatus = [];
    const f = await put_full_config_model(file);

    const relativePath = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const directoryPath = path.join(
      __dirname,
      "..",
      "..",
      relativePath,
      "response_folder"
    );

    const files = fs.readdirSync(directoryPath);
    console.log(files, "llllllllllllllllllllllll");
    files.forEach(async (fil) => {
      if (fil.startsWith("response_")) {
        await fs.unlinkSync(
          path.join(__dirname, "..", "..", relativePath, "response_folder", fil)
        );
      }
    });
    res.status(200).send("Delete successfully");
  } catch (error) {
    console.log("Error in Delete History", error);
    res.send("Delete Failed");
  }
}

async function GetAllVeloConfig(req, res, next) {
  try {
    const f = await GetAllVeloConfigModel();
    const obj = {
      config_name: "Add Collector",
      description: "This IS The Description Of The Collector",
      config: {
        Artifacts: [
          {
            name: "Change This As This Is An Example",
            parameters: {
              ExampleParam1: false,
              ExampleParam2: "exe,cpl,dll,kkk",
            },
          },
          {
            name: "Change This As This Is An Example 2",
            parameters: {},
          },
        ],
        Resources: {
          CpuLimit: 30,
          MaxExecutionTimeInSeconds: 600,
          MaxIdleTimeInSeconds: 600,
        },
        Configuration: {
          EncryptionScheme: "None",
          EncryptionSchemeValue: "",
          CollectorFileName: "Collector-ChangeName",
          OutputsFileName: "Collector-ChangeName-Outputs",
          ZipSplitSizeInMb: 1000,
        },
      },
    };
    f.push(obj);
    res.send(f);
  } catch (error) {
    console.log("Error in GetAllVeloConfig", error);
  }
}
async function SaveConfigVelo(req, res, next) {
  try {
    const response = await SaveConfigVeloModel(req.body);
    res.send(response);
  } catch (error) {
    console.log("Error in SaveConfigVelo", error);
  }
}
async function InsertConfigVelo(req, res, next) {
  try {
    const response = await AddConfigVeloModel(req.body);
    res.send(response);
  } catch (error) {
    console.log("Error in SaveConfigVelo", error);
  }
}

async function GetAllVeloConfigSideBar(req, res, next) {
  try {
    const response = await GetAllVeloConfigSideBarModel(req.body);
    res.send(response);
  } catch (error) {
    console.log("Error in GetAllVeloConfigSideBar", error);
  }
}
async function GetSpecificCollector(req, res, next) {
  try {
    console.log(req.body);

    const PYTHON_SCRIPTS_RELATIVE_PATH =
      process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const RELATIVE_PATH = path.resolve(__dirname, "..", "..");
    const PYTHON_SCRIPT_PATH = path.resolve(
      RELATIVE_PATH,
      PYTHON_SCRIPTS_RELATIVE_PATH,
      "modules",
      "Collector",
      "create_collection_file.py"
    );

    const command =
      "python " + PYTHON_SCRIPT_PATH + ` "${req.body.id}" "${req.body.os}"`;
    console.log(command);
    const response = await GetSpecificCollectorModal(command);

    console.log(response, "response flip");
    if (response) {
      const PythonCollectorPath = path.resolve(
        RELATIVE_PATH,
        PYTHON_SCRIPTS_RELATIVE_PATH,
        response
      );
      console.log(
        PythonCollectorPath,
        "PythonCollectorPath PythonCollectorPath"
      );
      const exist = await fs.existsSync(PythonCollectorPath);
      console.log(
        exist,
        "ooooooooooooooooooooooooooooooooossssssssssssssssssssssssss"
      );
      if (exist) {
        res.download(PythonCollectorPath);
      } else {
        res.status(401).send({ error: "no such file" });
      }
    }
  } catch (error) {
    console.log("Error in  GetSpecificCollector", error);
  }
}
module.exports = {
  GetAllVeloConfigSideBar,
  GetSpecificCollector,
  InsertConfigVelo,
  SaveConfigVelo,
  Get_Config,
  Put_Config,
  Get_From_ENV,
  Update_mssp_config_json_links,
  ResetConfigToBasic,
  DownloadAgent,
  GetAllLeakAsset,
  ExportAllAssets,
  ImportAllAssets,
  DeleteResultHistory,
  GetAllVeloConfig,
};
