const router = require("express").Router();

const ResourcesRoutes = require("./ResourcesRoutes");
const ToolsRoutes = require("./ToolsRoutes");
const ResultsRoutes = require("./ResultsRoutes");
const ConfigRoutes = require("./ConfigRoutes");
const ProcessRoutes = require("./ProcessRoutes");
const UsersRoutes = require("./UsersRoutes");
const LogsRoutes = require("./LogsRoutes");
const DashboardRoute = require("./DashboardRoute");
const AlertRoutes = require("./AlertRoutes");


router.use("/Resources", ResourcesRoutes);
router.use("/tools", ToolsRoutes);
router.use("/results", ResultsRoutes);
router.use("/config", ConfigRoutes);
router.use("/process", ProcessRoutes);
router.use("/users", UsersRoutes);
router.use("/logs", LogsRoutes);
router.use("/dashboard", DashboardRoute);
router.use("/Alerts", AlertRoutes);


module.exports = router;
