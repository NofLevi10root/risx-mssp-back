const router = require("express").Router();

const ToolsController = require("../controllers/ToolsController");

const {
  Check_if_have_the_correct_data,
} = require("../middleware/ToolsMiddleware");

//get info
router.get("/", ToolsController.Get_All_Tools); //get all the Resources
router.get(
  "/all-velociraptor_artifacts",
  ToolsController.get_all_velociraptor_artifacts
); //get all the Resources

//put
router.put("/enable-disable-module", ToolsController.enable_disable_module);
router.put("/enable-disable-artifact", ToolsController.enable_disable_artifact);

router.put("/show-in-ui", ToolsController.show_in_ui_module);
router.put(
  "/change-modules-preview-position",
  ToolsController.change_modules_preview_position
);

//active modules

router.get(
  "/active-velociraptor-artifact",
  ToolsController.active_velocirapto_artifact
); ///check to delete
router.get(
  "/active-module",
  Check_if_have_the_correct_data,
  ToolsController.active_modules
); ///check to delete

router.post("/TagSelection", ToolsController.TagSelection); /// delete me


router.put("/tmp1", ToolsController.tmp1); /// delete me

module.exports = router;
