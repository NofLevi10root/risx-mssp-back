const { GetISTimeSketchRun } = require("../models/ConfigModels");
const {
  check_main_process_status_model,
  active_manual_process_model,
  active_interval_process_model,
  get_all_python_processes,
  search_And_Kill_Process,
  search_Plaso_Process,
} = require("../models/ProcessModels");

async function check_and_active_interval(req, res, next) {
  try {
    const checkRunning = await check_main_process_status_model()
      .then((isRunning) => {
        console.log("Process running status:", isRunning);
        return false;
      })
      .catch((error) => {
        console.error("Error:", error);
        return error;
      });

    if (checkRunning) {
      console.log("checkRunning === true", checkRunning);
      return checkRunning;
    }
    if (checkRunning === false) {
      console.log("checkRunning  === false , start running the interval");

      console.log(" go to active_interval_process_model");
      const now_active = await active_interval_process_model()
        .then((isActive) => {
          console.log("isActive", isActive);
          if (isActive === true) {
            res ? res.send(true) : "";
          } else if (isActive === false) {
            res ? res.send("Error") : "";
          }
        })
        .catch((error) => {
          console.log("out of active_interval_process_model");
          console.error("Error:", error);
          res ? res.send(false) : "";
          next ? next(error) : "";
        });
    }
  } catch (err) {
    console.log(err);
  }
}

async function kill_interval_of_python(req, res, next) {
  const file_name = process.env.PYTHON_INTERVAL; // Name of the Python process to search for

  console.log("kill_interval_of_python 00", file_name);
  try {
    const success = await search_And_Kill_Process(file_name);
    if (success) {
      res.status(200).json({ message: "Process(es) killed successfully." });
    } else {
      res.status(404).json({ message: "No matching processes found to kill." });
    }
  } catch (err) {
    res.status(500).json({ message: `Failed to kill process: ${err.message}` });
  }
}

async function Check_Interval_Status(req, res, next) {
  try {
    //     const momo = "3333"
    //  res.send(momo)
    const file_name = process.env.PYTHON_INTERVAL;
    const bobo = await check_main_process_status_model()
      .then((isRunning) => {
        console.log("Process running status:", isRunning);

        if (isRunning) {
          console.log(
            `${file_name} check_main_process_status_model: ${isRunning}`
          );
        }
        if (!isRunning) {
          check_and_active_interval(); // Checks if it is off and starts the interval important for when given to install
          console.error(
            `${file_name} check_main_process_status_model: ${isRunning}`
          );
        }

        res.send(true);
        // res.send(isRunning);
      })
      .catch((error) => {
        console.error("Error:", error);
        res.send("sssssssssssssssssss");
        next(error);
      });

    if (bobo) {
      console.log("isRunning bobo ", isRunning, "sssssss", bobo);
      // res.send(true);
    }
    if (bobo === false) {
      console.error(`${file_name} check_main_process_status_model: ${bobo}`);
      console.log("bobo === false");
      // res.send(false);
    }
  } catch (err) {
    console.error(` check_main_process_status_model catch(err): ${err}`);
    console.log(err);
  }

  // try {

  // const process_status = await check_main_process_status_model();

  //   const bobo =  await  check_main_process_status_model().then(isRunning => {
  //     console.log('Process running status:', isRunning);
  //     //  res.send(isRunning)
  //      ;
  //     if (bobo){      console.log('isRunning bobo ', isRunning,"sssssss",bobo );}
  // }).catch(error => {
  //     console.error('Error:', error);res.send("sssssssssssssssssss"); next(error);
  // });
}

// async function active_manual_process(req,res,next){
//   console.log("active_manual_process"  );

// try{
//   await  active_manual_process_model().then(isRunning => {
//   console.log('active_manual_process_model:', isRunning)
// if      (isRunning === true) {res.send(true);}
// else if(isRunning === false) { res.send("Error");}

// }).catch(error => {
//   console.error('Error:', error);res.send(false); next(error);
// });

//   }
//   catch(err)
//   {console.log("err in active_manual_process" , err);}

// }

async function active_manual_process(req, res, next) {
  console.log("active_manual_process");

  try {
    const isTimeSketch = await GetISTimeSketchRun();
    console.log(isTimeSketch, "isTimeSketch included in the run");
    if (isTimeSketch) {
      const plasoRun = await search_Plaso_Process();
      console.log(plasoRun, "plasoRun");
      if (plasoRun) {
        res.status(200).send({
          message: "Timescketch is Running let it finish and then try again",
          success: false,
        });
        return;
      }
      console.log("No plaso Keep Running");
    }

    await active_manual_process_model()
      .then((result) => {
        console.log("controller  ->  active_manual_process_model:", result);

        if (result.success === true) {
          // res.send(true);

          res.status(200).send({ message: result.message, success: true });
        } else if (result.success === false) {
          console.log("controller  ->  result.success === false:", result);
          console.error(`active_manual_process. error: ${result.message}`);
          res.status(500).send({ message: result.message, success: false });
        }
      })
      .catch((error) => {
        console.error(
          "controller  -> active_manual_process_model  .catch(error =>:",
          error
        );
        console.error(
          `active_manual_process. catch(error => error1: ${error.message}`
        );
        res.status(500).send({ message: error.message, success: false }); // Send the error message to the front end
        next(error);
      });
  } catch (err) {
    console.error(
      `active_manual_process. catch(error => error2: ${err.message}`
    );
    res.status(500).send({ message: err.message, success: false }); // Send the error message to the front end
    next(err);
  }
}

module.exports = {
  Check_Interval_Status,
  active_manual_process,
  check_and_active_interval,
  kill_interval_of_python,
};
// const isActive =  await  active_manual_process_model().then(isRunning => {
//   console.log('Process running status 22222222222222222222222222222222:', isRunning)
//   res.send(isRunning);

// }).catch(error => {
//   console.error('Error:', error);res.send("sssssssssssssssssss"); next(error);
// });

// if (isActive){      console.log('isRunning bobo ', isRunning,"sssssss",isActive );
// res.send("koko")
// }
