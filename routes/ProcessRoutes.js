const router = require("express").Router();

const ProcessController = require("../controllers/ProcessController");

//interval
router.get(
  "/check-and-active-interval-of-python",
  ProcessController.check_and_active_interval
);
router.get(
  "/kill-interval-of-python",
  ProcessController.kill_interval_of_python
);
router.get("/check-interval-status", ProcessController.Check_Interval_Status);

//manual
router.get("/active-manual-process", ProcessController.active_manual_process);

module.exports = router;
