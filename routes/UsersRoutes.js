const router = require('express').Router();

const UsersController  = require('../controllers/UsersController');
 
console.log("UsersController");


// router.post('/login',   UsersController.Login); 
router.post('/create-user',   UsersController.Create_user); 
router.get('/',         UsersController.Get_all_users);  //get all users



module.exports = router;


