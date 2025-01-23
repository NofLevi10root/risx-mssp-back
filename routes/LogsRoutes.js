const router = require('express').Router();

const LogsController  = require('../controllers/LogsController');
 
router.get('/get-log',               LogsController.Get_Log);  //get the config file
 

module.exports = router;


 