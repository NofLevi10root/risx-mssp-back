const fs = require("fs");
const util = require("util");
const path = require("path");

/**
 * Logger module that redirects console.log to a file
 * @param {string} logFilePath - Path to the log file
 * @param {boolean} preserveConsole - Whether to preserve console output
 * @returns {object} - The original console object
 */
function setupLogger(
  logFilePathArg = "../logs/BackEndLog.log",
  preserveConsole = true
) {
  // Store original console methods
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };
  const logFilePath = path.join(__dirname, logFilePathArg);

  // Ensure log directory and file exist
  const directory = path.dirname(logFilePath);

  // Helper function to ensure log file exists and return a valid write stream
  const getLogStream = () => {
    try {
      // Create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }

      // Create file if it doesn't exist
      if (!fs.existsSync(logFilePath)) {
        fs.writeFileSync(logFilePath, "");
      }

      // Create and return a new write stream
      const stream = fs.createWriteStream(logFilePath, { flags: "a" });

      // Add error handling for the file stream
      stream.on("error", (error) => {
        originalConsole.error(`Error writing to log file: ${error.message}`);
      });

      return stream;
    } catch (error) {
      originalConsole.error(`Error ensuring log file exists: ${error.message}`);
      return null;
    }
  };

  // Initial stream setup
  let logFile = getLogStream();

  // Helper function to write to log file
  const writeToLog = (level, message) => {
    try {
      // Check if file exists and recreate stream if needed
      if (!fs.existsSync(logFilePath) || !logFile || !logFile.writable) {
        // Close the current stream if it exists but is not writable
        if (logFile) {
          try {
            logFile.end();
          } catch (e) {
            // Ignore errors when closing
          }
        }

        // Get a new stream
        logFile = getLogStream();

        // If we can't create a stream, stop here
        if (!logFile) {
          return;
        }
      }

      // Write to the log file
      const timestamp = new Date().toISOString();
      logFile.write(`${timestamp} - ${level} - ${message}\n`);
    } catch (error) {
      originalConsole.error(`Error writing to log: ${error.message}`);
    }
  };

  // Override console.log
  console.log = function () {
    const message = util.format.apply(null, arguments);

    // Write to file with check
    writeToLog("INFO", message);

    // Also write to the original console if preserveConsole is true
    if (preserveConsole) {
      originalConsole.log.apply(console, arguments);
    }
  };

  // Override console.error
  console.error = function () {
    const message = util.format.apply(null, arguments);

    // Write to file with check
    writeToLog("ERROR", message);

    // Also write to the original console if preserveConsole is true
    if (preserveConsole) {
      originalConsole.error.apply(console, arguments);
    }
  };

  // Override console.warn
  console.warn = function () {
    const message = util.format.apply(null, arguments);

    // Write to file with check
    writeToLog("WARN", message);

    // Also write to the original console if preserveConsole is true
    if (preserveConsole) {
      originalConsole.warn.apply(console, arguments);
    }
  };

  // Override console.info
  console.info = function () {
    const message = util.format.apply(null, arguments);

    // Write to file with check
    writeToLog("INFO", message);

    // Also write to the original console if preserveConsole is true
    if (preserveConsole) {
      originalConsole.info.apply(console, arguments);
    }
  };

  // Return the original console object in case it's needed
  return originalConsole;
}

module.exports = setupLogger;
