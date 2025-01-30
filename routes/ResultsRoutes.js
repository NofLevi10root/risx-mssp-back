const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    try {
      const directoryPath = path.join(
        "/tmp",
        path.parse(file.originalname).name.split("-r___r-")[0]
      );

      console.log(
        "file.originalnamefile .originalnamefile .originalnamefile.originalname ",
        req.body,
        directoryPath,
        fs.existsSync(directoryPath)
      );
      if (!fs.existsSync(directoryPath)) {
        console.log(12);
        await fs.mkdirSync(directoryPath);
        console.log(22);
      }
      req.body.PathOfFile = path.join(
        directoryPath,
        path.parse(file.originalname).name.replace(".7z", ".zip")
      );
      req.body.FileFolder = directoryPath;
      req.body.FileZipPath = path.join(
        directoryPath,
        path.parse(file.originalname).name + ".001"
      );
      console.log("File Prep Done ", file.originalname);
      

      cb(null, directoryPath);
    } catch (error) {
      console.log("Error in File Upload Multer  :  ", error);
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
const ResultsController = require("../controllers/ResultsController");

router.get("/get_all_requests_table", ResultsController.get_all_requests_table);
router.get(
  "/velociraptor-single-result",
  ResultsController.get_single_velociraptor_response
);
router.get("/download-json-file", ResultsController.download_json_file);

router.get(
  "/velociraptor-aggregate-macro",
  ResultsController.get_velociraptor_aggregate_macro
);
router.get(
  "/check_last_req_and_res_for_module",
  ResultsController.check_last_req_and_res_for_module
); /// check to delete

router.delete("/delete-results-by-ids/", ResultsController.delete_results);
router.post(
  "/ImportVeloResult",
  upload.single("file"),
  ResultsController.ImportVeloResult
);

//  router.get('/count-responses-files', ResultsController.count_velociraptor_responses);

//  router.get('/get_all_latest_results_dates', ResultsController.get_all_latest_results_dates);
//

/// its for test
//  router.post('/write_to_csv', ResultsController.write_to_csv);
// router.get('/all-request-and-response', ResultsController.get_all_request_and_response);
//  router.get('/all-velociraptor-results', ResultsController.get_all_velociraptor_responses_file_list);

module.exports = router;
