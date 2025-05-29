const {
  Get_all_users_model,
  check_if_email_exists,
  insert_new_user,
} = require("../models/UsersModels");
//  const DBConnection = require('../db.js')
const bcrypt = require("bcrypt");

async function Create_user(req, res, next) {
  console.log(req.body);
  const { user_name, email, password, type, address, state, phone_number } =
    req.body;

  if (!user_name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await check_if_email_exists(email);
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Insert new user
    const new_id = await insert_new_user(
      user_name,
      email,
      password,
      type,
      address,
      state,
      phone_number
    );

    if (new_id) {
      console.log("new_user1id_short", new_id);
      res
        .status(201)
        .json({
          success: true,
          message: "User registered successfully",
          new_id,
        });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
}

async function Get_all_users(req, res, next) {
  console.log("Get_all_users");
  try {
    const all = await Get_all_users_model();
    res.send(all);
  } catch (err) {
    console.error(err);
  }
}

// async function Login(req, res, next) {
//   console.log("Login");
//   const { input_email, input_password } = req.body;
//  console.log("input_email",input_email);
//  console.log("input_password",input_password);

//  try {
//   const user = await check_if_user_exists(input_email);
// console.log("user",user);
//   if (user) {
//     const match = await bcrypt.compare(password, user.password);

//     if (match) {
//       // Create JWT token
//       const token = jwt.sign(
//         { userId: user.id, email: user.email },
//         JWT_SECRET,
//         { expiresIn: '24h' }
//       );

//       // Set the token as an HTTP-only cookie
//       res.cookie('token', token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//         maxAge: 24 * 60 * 60 * 1000 // 24 hours
//       });

//       // Remove the password from the user object before sending
//       const { password, ...userWithoutPassword } = user;
//       res.json({
//         success: true,
//         user: userWithoutPassword
//       });
//     } else {
//       res.json({ success: false, message: 'Invalid credentials' });
//     }
//   } else {
//     res.json({ success: false, message: 'User not found' });
//   }
// } catch (error) {
//   console.error('Login error:', error);
//   res.status(500).json({ success: false, message: 'Server error' });
// }
// }

module.exports = {
  Get_all_users,
  //  Login,
  Create_user,
};
