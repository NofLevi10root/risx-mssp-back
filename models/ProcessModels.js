// const { error } = require('ajv/dist/vocabularies/applicator/dependencies.js')
// const { DiscrError } = require('ajv/dist/vocabularies/discriminator/types.js')

//  const config_table = "configjson"
//  const config_column = "config"
//  const fs = require('fs');  // Import 'fs' with Promise-based API
// const fs_promises = require('fs').promises; // Import 'fs' with Promise-based API
// const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const { spawn } = require("child_process");
const path = require("path");
const { exec } = require("child_process");
const DBConnection = require("../db.js");
const { log } = require("console");
const readline = require("readline");

async function RunAlertHelperModal(status) {
  console.log("----- RunAlertHelperModal ------------");

  const SCRIPTS_FOLDER = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
  const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE;
  const PYTHON_EXECUTABLE_RELATVE = path.resolve(
    __dirname,
    "..",
    "..",
    SCRIPTS_FOLDER,
    "helpers",
    "alerts",
    "main.py"
  );

  const command = `python ${PYTHON_EXECUTABLE_RELATVE} ${
    status == "modification" ? "-m" : "-u"
  }`;
  console.log("command interval = ", command);

  try {
    return new Promise((resolve, reject) => {
      const process = exec(
        command,
        { shell: "/bin/bash" },
        (error, stdout, stderr) => {
          console.log("RunAlertHelperModal - Promise");

          if (error) {
            console.log(
              "RunAlertHelperModal - return new Promise error",
              error
            );
            // console.error(`Error: ${error.message}`);
            // console.log(`stderr: ${stderr}`);
            reject(false); // Reject with false indicating failure
            return error;
          }

          resolve(true); // Resolve with true indicating success
        }
      );

      // Start interval loop
      process.stdout.on("data", (data) => {
        resolve(true);
      });
    });
  } catch (error) {
    console.error("Error checking process status:", error);
    return false;
  }
}

async function check_main_process_status_model() {
  const file_name = process.env.PYTHON_INTERVAL;
  console.log("check_main_process_status_model - file_name", file_name);
  try {
    const isRunning = await new Promise((resolve, reject) => {
      const command = `ps aux | grep '[p]ython'`;

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error.message}`);
          reject(false);
          return;
        }

        if (stderr) {
          console.error(`Error: ${stderr}`);
          reject(false);
          return;
        }

        // Check if any line contains the file name
        const lines = stdout.trim().split("\n");
        let isRunning = false;

        for (let line of lines) {
          if (line.includes(file_name)) {
            console.log("check_main_process_status_model - line", line);

            isRunning = true;
            break;
          }
        }

        if (isRunning) {
          console.log(`${file_name} is running`);
          resolve(true);
        } else {
          console.log(`${file_name} is not running`);
          resolve(false);
        }
      });
    });

    return isRunning;
  } catch (error) {
    console.error("Error checking process status:", error);
    return false;
  }
}

async function active_interval_process_model() {
  console.log("----- active_interval_process_model ------------");

  const SCRIPTS_FOLDER = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
  const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE;
  const PYTHON_EXECUTABLE_RELATVE = path.resolve(
    __dirname,
    "..",
    "..",
    PYTHON_EXECUTABLE
  );
  const PYTHON_ENVIRONMENT = path.resolve(
    __dirname,
    "..",
    "..",
    SCRIPTS_FOLDER,
    "mssp_env",
    "bin",
    "activate"
  );
  // const SCRIPTS_PATH = path.resolve(__dirname, '..', '..', SCRIPTS_FOLDER,  'modules', 'Velociraptor')
  const SCRIPTS_PATH = path.resolve(__dirname, "..", "..", SCRIPTS_FOLDER);

  console.log("PYTHON_EXECUTABLE_RELATVE   = ", PYTHON_EXECUTABLE_RELATVE);

  const PYTHON_INTERVAL_FILENAME = process.env.PYTHON_INTERVAL;

  // const command = `
  // source ${PYTHON_ENVIRONMENT} && \
  // ${PYTHON_EXECUTABLE_RELATVE} ${SCRIPTS_PATH}/${PYTHON_INTERVAL_FILENAME}
  // `;

  const command = `python ${SCRIPTS_PATH}/${PYTHON_INTERVAL_FILENAME}`;
  console.log("command interval = ", command);

  try {
    return new Promise((resolve, reject) => {
      const process = exec(
        command,
        { shell: "/bin/bash" },
        (error, stdout, stderr) => {
          console.log("active_interval_process - Promise");

          if (error) {
            console.log(
              "active_interval_process - return new Promise error",
              error
            );
            // console.error(`Error: ${error.message}`);
            // console.log(`stderr: ${stderr}`);
            reject(false); // Reject with false indicating failure
            return error;
          }

          if (stdout.includes("Start interval loop")) {
            console.log("active_interval_process - Start interval loop");
            // console.log("stdout.includes(Start mssp):", stdout);
            resolve(true); // Resolve with true indicating success
          } else {
            console.log(
              "active_interval_process - Python script did not indicate success."
            );
            // console.log(`stdout: ${stdout}`);
            // console.log(`stderr: ${stderr}`);
            resolve(false); // Resolve with false indicating failure
          }
        }
      );

      // Start interval loop
      process.stdout.on("data", (data) => {
        if (data.includes("Start interval loop")) {
          //  console.log(`yeaaa in process: `)
          resolve(true);
        }
        // Resolve with true indicating success
      });

      // process.stderr.on('data', (data) => {
      //     console.error(`stderr: ${data}`);
      // });
    });
  } catch (error) {
    console.error(
      "active_interval_process - Error active_interval_process_model",
      error
    );
    return false;
  }
}

// async function active_manual_process_model_______old() {

//     try{

//         const PYTHON_EXECUTABLE  = process.env.PYTHON_EXECUTABLE;
//         const PYTHON_EXECUTABLE_RELATVE = path.resolve(__dirname, '..', '..', PYTHON_EXECUTABLE)
//         const PYTHON_SCRIPTS_RELATIVE_PATH = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
//         const PYTHON_MANUAL_ACTIVE = process.env.PYTHON_MANUAL_ACTIVE;
//         const RELATIVE_PATH = path.resolve(__dirname, '..', '..');
//         const PYTHON_SCRIPT_PATH = path.resolve(RELATIVE_PATH, PYTHON_SCRIPTS_RELATIVE_PATH, PYTHON_MANUAL_ACTIVE);
//         console.log("active_manual_process_model");

//         const command = `source ~/mssp/risx-mssp-python-script/mssp_env/bin/activate && ${PYTHON_EXECUTABLE_RELATVE}`;
//         // const command = `python`;

//         console.log("command", command);

//         const args = [PYTHON_SCRIPT_PATH];
//         console.log("active_manual_process_model 2");
//         return new Promise((resolve, reject) => {
//             const childProcess = spawn(command, args, {
//                 shell: '/bin/bash',
//                 env: { ...process.env },
//             });

//             let found = false;
//             console.log("active_manual_process_model 3");

//             childProcess.stdout.on('data', (data) => {

//                 console.log("Start find if includes - ``Start mssp``");
//                 if (data.toString().includes("Start mssp")) {
//                     found = true;
//                     console.log("stdout.includes(Start mssp)");
//                     resolve(true); // Resolve with true indicating success
//                     // Do not kill the process, let it continue running
//                 }
//             });

//             childProcess.stderr.on('data', (data) => {
//                 console.error(`stderr: ${data}`);
//             });

//             childProcess.on('close', (code) => {
//                 if (!found) {
//                     console.log("Process closed with code:", code);
//                     if (code !== 0) {
//                         console.error(`Process exited with code ${code}`);
//                     }
//                     resolve(false); // Resolve with false indicating failure
//                 }
//             });

//             childProcess.on('error', (error) => {
//                 console.error(`Error: ${error.message}`);
//                 reject(false); // Reject with false indicating failure
//             });
//         });
//     }
//     catch (error) {
//         console.error('Error active_interval_process_model', error);
//         return false;
//     }

//     }

// async function active_manual_process_model() {

// try{

//     const PYTHON_EXECUTABLE  = process.env.PYTHON_EXECUTABLE;
//     const PYTHON_EXECUTABLE_RELATVE = path.resolve(__dirname, '..', '..', PYTHON_EXECUTABLE)
//     const PYTHON_SCRIPTS_RELATIVE_PATH = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
//     const PYTHON_MANUAL_ACTIVE = process.env.PYTHON_MANUAL_ACTIVE;
//     const RELATIVE_PATH = path.resolve(__dirname, '..', '..');
//     const PYTHON_SCRIPT_PATH = path.resolve(RELATIVE_PATH, PYTHON_SCRIPTS_RELATIVE_PATH, PYTHON_MANUAL_ACTIVE);
//     console.log("active_manual_process_model");

//     const command = `source ~/mssp/risx-mssp-python-script/mssp_env/bin/activate && ${PYTHON_EXECUTABLE_RELATVE}`;
//     // const command = `python`;

//     const args = [PYTHON_SCRIPT_PATH];
//     console.log("active_manual_process_model 2");
//     return new Promise((resolve, reject) => {
//         const childProcess = spawn(command, args, {
//             shell: '/bin/bash',
//             env: { ...process.env },
//         });
//         const pid = childProcess.pid;
//         console.log(PYTHON_MANUAL_ACTIVE, ` Started process with PID: ${pid}`);
//         let found = false;
//         console.log("active_manual_process_model 3");

//         // childProcess.stdout.on('data', (data) => {

//         //     console.log("Start find if includes - ``Start mssp``");
//         //     if (data.toString().includes("Start mssp")) {
//         //         found = true;
//         //         console.log("stdout.includes(Start mssp)");
//         //         resolve(true); // Resolve with true indicating success
//         //         // Do not kill the process, let it continue running
//         //     }
//         // });

//         childProcess.stderr.on('data', (data) => {
//             console.error(`stderr: ${data}`);
//         });

//         childProcess.on('close', (code) => {

//             if (pid) {

//                 if (typeof pid === "number" ) {
//                     console.log("active_manual_process_model  - true ( process = 'close'), got pid number: ", pid ,"code: " , code);
//                     resolve(true);}
//             }

//             if (!pid) {
//                 console.log("active_manual_process_model  - false ( process = 'close'),  !pid ", "code: " , code);

//                 resolve(false);    }

//         });

//         childProcess.on('error', (error) => {
//             console.error(`active_manual_process_model  - false by Error: ${error.message}`);
//             reject(false); // Reject with false indicating failure
//         });

//       // Wait for 0.2 seconds after getting the PID before resolving
//       if (pid  && typeof pid === "number" ) {
//         setTimeout(() => {
//             console.log(" active_manual_process_model  - true by setTimeout  - pid:", pid );
//             resolve(true);
//         }, 300);
//     } else {

//         console.log(" active_manual_process_model  - false by setTimeout  - not pid" );
//         resolve(false);
//     }

//     });
// }
// catch (error) {

//     console.error('Error active_interval_process_model', error);
//     return false;
// }

// }

async function active_manual_process_model() {
  try {
    const PYTHON_EXECUTABLE = process.env.PYTHON_EXECUTABLE;
    const PYTHON_EXECUTABLE_RELATIVE = path.resolve(
      __dirname,
      "..",
      "..",
      PYTHON_EXECUTABLE
    );
    const PYTHON_SCRIPTS_RELATIVE_PATH =
      process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
    const PYTHON_MANUAL_ACTIVE = process.env.PYTHON_MANUAL_ACTIVE;
    const RELATIVE_PATH = path.resolve(__dirname, "..", "..");
    const PYTHON_SCRIPT_PATH = path.resolve(
      RELATIVE_PATH,
      PYTHON_SCRIPTS_RELATIVE_PATH,
      PYTHON_MANUAL_ACTIVE
    );

    // const command = `source ~/mssp/risx-mssp-python-script/mssp_env/bin/activate && ${PYTHON_EXECUTABLE_RELATIVE}`;
    const command = `python`;
    const args = [PYTHON_SCRIPT_PATH];

    console.log(
      "active_manual_process_model file name is:",
      PYTHON_MANUAL_ACTIVE
    );
    console.log("active_manual_process_model       command:", command);

    return new Promise((resolve, reject) => {
      const childProcess = spawn(command, args, {
        shell: "/bin/bash",
        env: { ...process.env },
      });

      const pid = childProcess.pid;
      console.log(PYTHON_MANUAL_ACTIVE, `Started process with PID: ${pid}.`);

      childProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
        const errorMessage = data.toString();
        resolve({ success: false, message: errorMessage });
      });

      childProcess.on("close", (code) => {
        if (pid && typeof pid === "number") {
          const successMessage = `A Manual Process has Started to run true by: (process = 'close'). PID: ${pid}.`;
          console.log(successMessage);
          resolve({ success: true, message: successMessage });
          // } else {
          //     const errorMessage = `active_manual_process_model - false (process = 'close'), !pid, code: ${code}`;
          //     console.log(errorMessage);
          //     resolve({ success: false, message: errorMessage });
        }
      });

      childProcess.on("error", (error) => {
        const errorMessage = `Error cant active the file: ${PYTHON_MANUAL_ACTIVE} in active_manual_process_model - false by childProcess.on('error'). Error message: ${error.message}.`;
        console.error(errorMessage);
        reject(new Error(errorMessage)); // Reject with the error indicating failure
      });

      const time_to_wait = 1000;

      // Wait for 0.3 seconds after getting the PID before resolving

      setTimeout(() => {
        if (pid && typeof pid === "number") {
          const successMessage = `A Manual Process has Started to run. true by Timeout. PID: ${pid}.`;
          console.log(successMessage);
          resolve({ success: true, message: successMessage });
        } else {
          const errorMessage = `Error cant active the file: ${PYTHON_MANUAL_ACTIVE} in active_manual_process_model - false by Timeout - wait ${
            time_to_wait / 1000
          } seconds and didnt get python process PID.`;
          console.log("errorMessage:", errorMessage);
          resolve({ success: false, message: errorMessage });
        }
      }, time_to_wait);
    });
  } catch (error) {
    const errorMessage = `Error: cant active the file: ${PYTHON_MANUAL_ACTIVE}. error: ${error.message}`;
    console.error(errorMessage);
    throw new Error(errorMessage); // Throw the error to be caught by the caller
  }
}

function search_Plaso_Process() {
  return new Promise((resolve, reject) => {
    // Search for the process
    exec(`sudo docker ps `, (err, stdout, stderr) => {
      console.log("err", err, "stdout", stdout, "stderr", stderr);

      if (err) {
        console.error(`Error searching for process: ${err}`);
        return reject(err);
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return reject(stderr);
      }

      if (!stdout) {
        console.log("No such process found.");
        return resolve(false);
      }
      if (stdout.includes("plaso")) {
        console.log(true);

        return resolve(true);
      } else {
        console.log(false);

        return resolve(false);
      }
    });
  });
}

function search_And_Kill_Process(processName, useSIGKILL = true) {
  console.log("Searching and killing process:", processName);

  return new Promise((resolve, reject) => {
    // Search for the process
    exec(
      `ps aux | grep ${processName} | grep -v grep`,
      (err, stdout, stderr) => {
        if (err) {
          console.error(`Error searching for process: ${err}`);
          return reject(err);
        }

        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return reject(stderr);
        }

        if (!stdout) {
          console.log("No such process found.");
          return resolve(false);
        }

        const processLines = stdout
          .split("\n")
          .filter((line) => line.includes(processName));
        const pids = processLines.map((line) => line.trim().split(/\s+/)[1]);

        if (pids.length === 0) {
          console.log("No matching processes found.");
          return resolve(false);
        }

        let killPromises = pids.map((pid) => {
          return new Promise((resolve, reject) => {
            // Use `kill -9` if `useSIGKILL` is true, otherwise use `kill`
            const killCommand = useSIGKILL ? `kill -9 ${pid}` : `kill ${pid}`;

            exec(killCommand, (err, stdout, stderr) => {
              if (err) {
                console.error(`Error killing process ${pid}: ${err}`);
                return reject(err);
              }

              if (stderr) {
                console.error(`stderr: ${stderr}`);
                return reject(stderr);
              }

              console.log(`Process ${pid} killed successfully.`);
              resolve(true);
            });
          });
        });

        Promise.all(killPromises)
          .then(() => resolve(true))
          .catch((err) => reject(err));
      }
    );
  });
}

async function get_all_python_processes() {
  return new Promise((resolve, reject) => {
    const command = "ps aux | grep python | grep -v grep";

    exec(command, (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }

      const processes = stdout
        .trim()
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const parts = line.split(/\s+/);
          const pid = parts[1];
          const command = parts.slice(10).join(" ");
          const name = command.split("/").pop(); // Get the last part of the path
          return { pid, name, command };
        });

      resolve(processes);
    });
  });
}

module.exports = {
  check_main_process_status_model,
  active_manual_process_model,
  active_interval_process_model,
  search_And_Kill_Process,
  get_all_python_processes,
  RunAlertHelperModal,
  search_Plaso_Process,
};

// const command2 = `
//     source ~/mssp/risx-mssp-python-script/mssp_env/bin/activate  && \
//     python  ~/mssp/risx-mssp-python-script/main.py
// `;

// console.log("command0",command);
// console.log("command2",command2);

// const command = `
//     source ~/mssp/risx-mssp-python-script/mssp_env/bin/activate  && \
//     python  ~/mssp/risx-mssp-python-script/modules/Velociraptor/VelociraptorInterval.py
// `;

// const command = `
// export PATH="${RELATIVE}/${PYTHON_SCRIPTS_RELATIVE_PATH}/mssp_env/bin:$PATH" && \
// ${PYTHON_EXECUTABLE_ABSOLUTE} ${PYTHON_SCRIPT_PATH}
// `;

// async function active_manual_process_model() {
//     console.log("active_manual_process_model");

//     const PYTHON_SCRIPTS_RELATIVE_PATH = process.env.PYTHON_SCRIPTS_RELATIVE_PATH;
//     const PYTHON_MANUAL_ACTIVE = process.env.PYTHON_MANUAL_ACTIVE;
//     const PYTHON_SCRIPT_PATH = path.resolve(__dirname, '..', '..', PYTHON_SCRIPTS_RELATIVE_PATH, PYTHON_MANUAL_ACTIVE);
//     const PYTHON_EXECUTABLE_ABSOLUTE = path.resolve(__dirname, '..', '..', PYTHON_SCRIPTS_RELATIVE_PATH,  'mssp_env', 'bin', 'python3');

//     const RELATIVE = path.resolve(__dirname, '..', '..');

// // const command = `
// // export PATH="/home/Bacteria5570/mssp/risx-mssp-python-script/mssp_env/bin:$PATH" && \
// // ${PYTHON_EXECUTABLE_ABSOLUTE} ${PYTHON_SCRIPT_PATH}
// // `;

//     const command = `
//         export PATH="${RELATIVE}/${PYTHON_SCRIPTS_RELATIVE_PATH}/mssp_env/bin:$PATH" && \
//         ${PYTHON_EXECUTABLE_ABSOLUTE} ${PYTHON_SCRIPT_PATH}
//     `;

//     return new Promise((resolve, reject) => {
//         exec(command, { shell: '/bin/bash' }, (error, stdout, stderr) => {
//             console.log("stdout:", stdout);
//             console.log("stderr:", stderr);

//             if (error) {
//                 console.error(`Error: ${error.message}`);
//                 reject(false); // Reject with false indicating failure
//                 return;
//             }

//             // Combine stdout and stderr for the message check
//             const combinedOutput = stdout + stderr;

//             if (combinedOutput.includes("Config updated successfully")) {
//                 resolve(true); // Resolve with true indicating success
//             } else {
//                 console.log("Python script did not indicate success.");
//                 resolve(false); // Resolve with false indicating failure
//             }
//         });
//     });
// }

// const command = `
// export PATH="/home/Bacteria5570/mssp/risx-mssp-python-script/mssp_env/bin:$PATH" && \
// ${PYTHON_EXECUTABLE_ABSOLUTE} ${PYTHON_SCRIPT_PATH}
// `;
// const command = `
// export PATH="${RELATIVE}/${PYTHON_SCRIPTS_RELATIVE_PATH}/mssp_env/bin:$PATH" && \
// ${PYTHON_EXECUTABLE_ABSOLUTE} ${PYTHON_SCRIPT_PATH}
// `;

//  source ~/mssp/risx-mssp-python-script/mssp_env/bin/activate
//   python main.py

// async function active_manual_process_model() {
