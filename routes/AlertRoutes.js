const {
  GetAlertFileData,
  UpdateAlertFileData,
  UpdateAlertState,
  GetAlertsConfig,
  UpdateAlertConfig,
  GetAllAlertsMonitor,
  ClearAlertDataChange,
} = require("../controllers/AlettController");

const router = require("express").Router();

router.get("/GetAllAlertsMonitor", GetAllAlertsMonitor); //Update the Alert config file
router.get("/GetAlertFileData", GetAlertFileData); //get the config file

router.post("/UpdateAlertFileData", UpdateAlertFileData); //Update the config file
router.post("/UpdateAlertState", UpdateAlertState); //Update the config file
router.post("/GetAlertsConfig", GetAlertsConfig); //Update the Alert config file
router.post("/UpdateAlertConfig", UpdateAlertConfig); //Update the Alert config file
router.post("/ClearAlertDataChange", ClearAlertDataChange); //Update the Alert config file

module.exports = router;
