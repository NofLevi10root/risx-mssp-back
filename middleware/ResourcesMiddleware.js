const Ajv = require("ajv");
const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

const {
  does_Website_Name_Exist_Model,
  does_Website_Id_Exist_Model,
  check_if_string_exist_in_db,
  check_if_id_exist_in_db,
  get_single_resource_by_id,
  check_if_string_exist_in_db_entity,
  get_single_entity_by_id,
} = require("../models/ResourcesModels");

function validateBody(schema) {
  return (req, res, next) => {
    const valid = ajv.validate(schema, req.body);

    // console.log("start   validation body", req.body);

    if (!valid) {
      console.log(ajv?.errors[0]?.message);

      console.log(
        `In field ${ajv?.errors[0]?.message} In field ${ajv?.errors[0]?.instancePath}`
      );
      // return res.status(400).send(ajv?.errors[0]?.message)
      return res
        .status(400)
        .send(
          `${ajv?.errors[0]?.message} In field ${ajv?.errors[0]?.instancePath}`
        );
    }
    next();
  };
}
async function Check_if_resource_exists_to_avoid_duplication_for_post(
  req,
  res,
  next
) {
  const { resource_string, item_types_list } = req.body;

  console.log("item_types_list", item_types_list);

  const exist = await check_if_string_exist_in_db(
    resource_string,
    item_types_list
  );
  if (exist) {
    res
      .status(400)
      .send(`Asset named "${resource_string}" already exists for this type.`);

    console.log("This Asset is already in this type");
    return;
  }
  next();
}

async function Check_if_resource_exists_to_avoid_duplication_for_post_entity(
  req,
  res,
  next
) {
  req.body.entityName = req.body?.entityName?.trim();

  const { entityName } = req.body;

  const exist = await check_if_string_exist_in_db_entity(entityName);
  if (exist) {
    res
      .status(400)
      .send(`Asset named "${entityName}" already exists for this type.`);

    console.log("This Asset is already in this type");
    return;
  }
  next();
}

async function Check_if_resource_exists_to_avoid_duplication_for_edit(
  req,
  res,
  next
) {
  const { resource_string, item_types_list, resource_id } = req.body;

  // console.log("item_types_list" ,item_types_list);

  const [the_original] = await get_single_resource_by_id(resource_id);

  // console.log("Check_if_resource_exists_to_avoid_duplication_for_edit"  );

  if (the_original?.resource_string === resource_string) {
    console.log("not try to change string");
    next();
  }

  if (the_original?.resource_string != resource_string) {
    console.log("try to change his name");

    const exist = await check_if_string_exist_in_db(
      resource_string,
      item_types_list
    );

    if (exist) {
      res
        .status(400)
        .send(
          `Cant Change to "${resource_string}", its already exists for this type.`
        );

      console.log("This Asset is already in this type");
      return;
    }
    next();

    // return res.status(400).send(`try to change your name`)
  }
}

async function Check_if_resource_exists_to_avoid_duplication_for_edit_entity(
  req,
  res,
  next
) {
  req.body.entityName = req.body?.entityName?.trim();

  console.log(
    req.body,
    "req.body req.body req.body req.bodyreq.bodyreq.bodyreq.bodyreq.bodyreq.bodyreq.bodyreq.body"
  );

  const { entitiesId, entityName } = req.body;

  // console.log("item_types_list" ,item_types_list);

  const [the_original] = await get_single_entity_by_id(entitiesId);

  // console.log("Check_if_resource_exists_to_avoid_duplication_for_edit"  );

  if (the_original?.entity_name === entityName) {
    console.log("not try to change string");
    next();
  }

  if (the_original?.entity_name != entityName) {
    console.log("try to change his name");

    const exist = await check_if_string_exist_in_db_entity(entityName);

    if (exist) {
      res
        .status(400)
        .send(
          `Cant Change to "${entityName}", its already exists for this type.`
        );

      console.log("This Asset is already in this type");
      return;
    }
    next();

    // return res.status(400).send(`try to change your name`)
  }
}

// if(resource_string === the_original?.resource_string){
//   console.log("if true allow -  its his string name" ,resource_string === the_original?.resource_string);
//   next()
// }

// else if (resource_string != the_original?.resource_string){
//   console.log("not his name lets chack"  );

//   const exist =  await check_if_string_exist_in_db(resource_string ,item_types_list)
//   if (exist){
//    res.status(400).send(`Asset named "${resource_string}" already exists for this type.`);

//     console.log("This Asset is already in this type");return}

// }

// console.log("the_original" ,the_original);

// const exist =  await check_if_string_exist_in_db(resource_string ,item_types_list)
// console.log("exist.exist" ,exist);

//   if (exist){
//    res.status(400).send(`Asset named "${resource_string}" already exists for this type.`);

//     console.log("This Asset is already in this type");return}
//  next()

// console.log("return 123");
// return

async function Check_if_resource_id_exists_to_continue(req, res, next) {
  const { resource_id } = req.body;

  const exist = await check_if_id_exist_in_db(resource_id);

  if (!exist) {
    res.status(400).send("Resource id not exists");
    console.log("Resource id not exists");
    return;
  }
  next();
}

function Check_if_website_name_exists_to_avoid_duplication(req, res, next) {
  console.log(
    "inside the middleware  --  Check_if_website_name_exists_to_avoid_duplication"
  );

  const { Name } = req.body;
  console.log("got it from reg.body", Name);
  const sitename = does_Website_Name_Exist_Model(Name);
  console.log("the anwser from model ", sitename);

  if (sitename) {
    console.log("sitename is already exists");
    res.status(400).send("sitename is already exists");
    return;
  }

  next();
}

function Check_if_website_id_exists(req, res, next) {
  const { id } = req.params;
  const siteId = does_Website_Id_Exist_Model(id);
  console.log("the anwser from model ", siteId);

  if (!siteId) {
    console.log("siteId  not exists");
    res.status(400).send("siteId not exists");
    return;
  }

  next();
}

module.exports = {
  Check_if_website_name_exists_to_avoid_duplication,
  Check_if_website_id_exists,
  validateBody,
  Check_if_resource_exists_to_avoid_duplication_for_post,
  Check_if_resource_exists_to_avoid_duplication_for_edit,
  Check_if_resource_id_exists_to_continue,
  Check_if_resource_exists_to_avoid_duplication_for_post_entity,
  Check_if_resource_exists_to_avoid_duplication_for_edit_entity,
};
