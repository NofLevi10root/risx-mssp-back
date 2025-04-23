const router = require("express").Router();

const ConfigController = require("../controllers/ConfigController");

router.get("/", ConfigController.Get_Config); //get the config file
router.put("/", ConfigController.Put_Config); //get the config file

router.get("/from_env", ConfigController.Get_From_ENV); //get from env to front

router.put(
  "/mssp-config-json-links",
  ConfigController.Update_mssp_config_json_links
); //get the config file
router.get("/ResetConfigToBasic", ConfigController.ResetConfigToBasic); //get from env to front

router.post("/DownloadAgent", ConfigController.DownloadAgent); //get from env to front
router.get("/GetAllLeakAsset", ConfigController.GetAllLeakAsset); //get from env to front

router.get("/ExportAllAssets", ConfigController.ExportAllAssets);

router.post("/ImportAllAssets", ConfigController.ImportAllAssets);
router.get("/DeleteResultHistory", ConfigController.DeleteResultHistory);
router.get("/GetAllVeloConfig", ConfigController.GetAllVeloConfig);
router.post("/SaveConfigVelo", ConfigController.SaveConfigVelo);
router.post("/InsertConfigVelo", ConfigController.InsertConfigVelo);
router.get("/GetAllVeloConfigSideBar", ConfigController.GetAllVeloConfigSideBar);
router.post("/GetSpecificCollector", ConfigController.GetSpecificCollector);
router.post("/CreateStorageVeloDiskAgent", ConfigController.CreateStorageVeloDiskAgent);
router.post("/BringSpecificConfig", ConfigController.BringSpecificConfig);
router.post("/SaveSpecificConfig", ConfigController.SaveSpecificConfig);




module.exports = router;
