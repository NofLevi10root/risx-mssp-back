const { error } = require("ajv/dist/vocabularies/applicator/dependencies.js");
const DBConnection = require("../db.js");
const { DiscrError } = require("ajv/dist/vocabularies/discriminator/types.js");
const { exec } = require("child_process");
const config_table = "configjson";
// const config_table = "tmp1"
const config_column = "config";
const bcrypt = require("bcrypt");
const { v4: uuid } = require("uuid");

async function Get_all_users_model() {
  console.log("Get_all_users_model");

  try {
    const allusers = await DBConnection("users").select(
      "email",
      "user_id",
      "type",
      "user_name",
      "name",
      "last_login",
      "state",
      "createdAt",
      "updatedAt"
    );
    if (allusers) {
      return allusers;
    }
  } catch (err) {
    console.error("get_All_Resource_Type_model", err);
  }
}

async function check_if_email_exists(input_email) {
  console.log("check_if_input_email_exists0", input_email);

  try {
    //   const the_new_item = await DBConnection('all_resources').select('*').where('resource_id', '=', id_with_r);

    // const user = await db('users').where({ email }).first();
    const user = await DBConnection("users")
      .where("email", "=", input_email)
      .first();
    if (user) {
      return user;
    }
  } catch (err) {
    console.error("check_if_email_exists", err);
  }
}

async function insert_new_user(
  user_name,
  email,
  password,
  type,
  address,
  state,
  phone_number
) {
  console.log("insert_new_user", user_name, email, password);

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const id = uuid();
    const id_short = "u" + id.replace(/-/g, "").substring(0, 9);
    // const id_with_r = 'u' + id_short;

    // console.log("password" , password);
    // console.log("hashedPassword" , hashedPassword);

    const [user] = await DBConnection("users").insert({
      user_id: id_short,
      user_name: user_name,
      email: email,
      user_password: hashedPassword,
      type: type,
      Address: address,
      state: state,
      phone_number: phone_number,
    });

    console.log("useruser", user);
    return id_short;
    // const user  = await DBConnection('users').where('email' ,'=', input_email ).first();
    // console.log("user",user);

    //  if (user){return user}
  } catch (err) {
    console.error("insert_new_user", err);
    return false;
  }
}

module.exports = {
  Get_all_users_model,
  check_if_email_exists,
  insert_new_user,
};
