const {
  GetAlertsFile,
  UpdateAlertFile,
  GetSortDate,
  GetAlertsConfigMod,
  UpdateAlertConfigMod,
  GetAllAlertsMonitorMod,
  GetSortDateBool,
  ClearAlertDataChangeMod,
} = require("../models/AlertModal");
const { get_full_config_model } = require("../models/ConfigModels");
const { RunAlertHelperModal } = require("../models/ProcessModels");

async function GetAlertFileData(req, res, next) {
  try {
    const data = await GetAlertsFile();
    const SortDate = new Date(await GetSortDate()).getTime();
    console.log("SortDateSortDateSortDateSortDateSortDate", SortDate);

    const Item = {
      New: 0,
      InProgress: 0,
      "False Positive": 0,
      "True Positive": 0,
      Ignore: 0,
      Closed: 0,
      Reopened: 0,
    };
    const Artifact = {};
    data.Alerts = data?.Alerts?.filter((x) => {
      if (
        (data?.AletDic[x?.Artifact?.trim()]?.Show ?? true) &&
        (x?._ts >= SortDate ||
          new Date(x?.UserInput?.ChangedAt).getTime() >= SortDate)
      ) {
        Item[x?.UserInput?.Status]++;
        if (
          !Artifact[data?.AletDic[x?.Artifact?.trim()]?.Name ?? x?.Artifact]
        ) {
          Artifact[data?.AletDic[x?.Artifact?.trim()]?.Name ?? x?.Artifact] =
            {};
          Artifact[
            data?.AletDic[x?.Artifact?.trim()]?.Name ?? x?.Artifact
          ].LastDate = x?._ts;
          Artifact[
            data?.AletDic[x?.Artifact?.trim()]?.Name ?? x?.Artifact
          ].Description = data?.AletDic[x?.Artifact?.trim()]?.Description;

          Artifact[
            data?.AletDic[x?.Artifact?.trim()]?.Name ?? x?.Artifact
          ].Num = 0;
          Artifact[
            data?.AletDic[x?.Artifact?.trim()]?.Name ?? x?.Artifact
          ].Show = data?.AletDic[x?.Artifact?.trim()]?.Show;
        }
        Artifact[data?.AletDic[x?.Artifact?.trim()]?.Name ?? x?.Artifact].Num++;

        x.SimpleName = data?.AletDic[x?.Artifact?.trim()]?.Name ?? x?.Artifact;
        x.Description = data?.AletDic[x?.Artifact?.trim()]?.Description;
        x.Show = data?.AletDic[x?.Artifact?.trim()]?.Show;
        return data?.AletDic[x?.Artifact?.trim()]?.Show ?? true;
      }
    });
    data.Artifact = Artifact;
    data.PieData = Item;

    res.send(data);
  } catch (error) {
    console.error(error, "GetAlertFileData GetAlertFileData");
  }
}

async function UpdateAlertFileData(req, res, next) {
  try {
    console.log("hello update ", req.body);
    const { Info } = req.body;
    Info.UserInput.UserId = "User";

    const up = await UpdateAlertFile(Info);
    if (up) {
      res.send(up);
    } else {
      res.status(404).send("No Such alert");
    }
  } catch (err) {
    console.error("Error In Update alert file ", err);
    res.status(404).send({ msg: "Error in update", error: err });
  }
}

async function UpdateAlertState(req, res, next) {
  try {
    console.log("hello update ", req.body);
    const { bool } = req.body;
    const up = await GetSortDateBool(bool);

    if (up) {
      res.send(up);
    } else {
      res.status(404).send("No Such alert");
    }
  } catch (err) {
    console.error("Error In Update alert file ", err);
    res.status(404).send({ msg: "Error in update", error: err });
  }
}

async function GetAlertsConfig(req, res, next) {
  try {
    console.log("hello update ", req.body);
    const { id } = req.body;
    const x = await RunAlertHelperModal("update");
    console.log("Updated");

    const responseMod = await GetAlertsConfigMod(id);
    res.send(responseMod);
  } catch (err) {
    console.error("Error In Update alert file ", err);
    res.status(404).send({ msg: "Error in update", error: err });
  }
}

async function UpdateAlertConfig(req, res, next) {
  try {
    console.log("hello update ", req.body);
    const { id, config } = req.body;
    const responseMod = await UpdateAlertConfigMod(id, config);
    if (responseMod) {
      const x = await RunAlertHelperModal("modification");
    }
    res.send({ bool: responseMod });
  } catch (err) {
    console.error("Error In Update alert file ", err);
    res.status(404).send({ msg: "Error in update", error: err });
  }
}

async function GetAllAlertsMonitor(req, res, next) {
  try {
    console.log("hello GetAllAlertsMonitor ", req.body);

    const responseMod = await GetAllAlertsMonitorMod();
    res.send(responseMod);
  } catch (err) {
    console.error("Error In UGetAllAlertsMonitor ", err);
    res.status(404).send({ msg: "Error in GetAllAlertsMonitor", error: err });
  }
}

async function ClearAlertDataChange(req, res, next) {
  try {
    console.log("hello ClearAlertDataChange ", req.body);

    const responseMod = await ClearAlertDataChangeMod();
    res.send(responseMod);
  } catch (err) {
    console.error("Error In ClearAlertDataChange ", err);
    res.status(404).send({ msg: "Error in ClearAlertDataChange", error: err });
  }
}
module.exports = {
  ClearAlertDataChange,
  GetAllAlertsMonitor,
  UpdateAlertConfig,
  GetAlertsConfig,
  UpdateAlertState,
  GetAlertFileData,
  UpdateAlertFileData,
};
