const Controller = require("../controllers/DashBoardController");

const router = require("express").Router();

router.get("/:DashBoardName", Controller.GetDashBoardFile); //get the config file
router.get(
  "/GetDashBoardClientIdVelo/:id",
  Controller.GetDashBoardClientIdVelo
); //get the config file

module.exports = router;
