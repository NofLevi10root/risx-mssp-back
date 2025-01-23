const { GetAlertFileData, UpdateAlertFileData } = require("../controllers/AlettController");

const router = require("express").Router();

router.get("/GetAlertFileData", GetAlertFileData); //get the config file
router.post("/UpdateAlertFileData", UpdateAlertFileData); //Update the config file


module.exports = router;
