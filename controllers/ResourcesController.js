const {
  // getDefaultColumnsAndTables, get_All_Resources_model ,get_All_Resources_model_Async ,addResource_Website,delete_resource_Website
  get_All_Resources_model,
  get_All_Resource_Type_model,
  Count_From_Same_Type_model,
  Make_Array_to_count_Resorce_by_type,
  check_if_id_exist_in_db,
  delete_single_resource_by_id,
  get_config_path_model,
  read_config_model,
  get_Same_Type_model,
  post_new_resource_model,
  UpdateMonitorSingleModal,
  UpdateMonitorMultiModal,
  GetAllModuleAssignedResources,
  getFullCategoryAndEntitiesListModal,
  AddEntityModal,
  UpdateEntityModal,
  DeleteSingleEntityModal,
  AddTagToResourceModal,
  DeleteTagToResourceModal,
} = require("../models/ResourcesModels");

const DBConnection = require("../db.js");
const { v4: uuid } = require("uuid");
const { get_all_Modules_model } = require("../models/ToolsModels.js");

async function get_All_Resources(req, res, next) {
  try {
    const All_Resources = await get_All_Resources_model();
    if (All_Resources) {
      // console.log("from sql -----------------" , All_Resources);

      res.send(All_Resources);
    }
  } catch (err) {
    console.error("Error in get_all_resources:", err);

    res.sand(err.message);
    next(err);
  }
}

async function get_Same_Type(req, res, next) {
  const { asset_type_id } = req.query;

  try {
    const Same_Type = await get_Same_Type_model(asset_type_id);
    if (Same_Type) {
      res.send(Same_Type);
    }
  } catch (err) {
    console.error("Error in get_same_type", err);

    res.sand(err.message);
    next(err);
  }
}

async function get_All_Resources_filtered(req, res, next) {
  //  console.log("2222", req.query);
  try {
    const { type_ids } = req.query;
    const { tool_ids } = req.query;

    console.log("type_ids", type_ids);
    //     console.log("tool_ids" ,tool_ids);

    if (typeof tool_ids === "undefined" && Array.isArray(type_ids)) {
      console.log("make a type filter");

      const All_Resources = await get_All_Resources_model();

      const containsType = (typesArray, typeIds) => {
        if (Array.isArray(typesArray) && typesArray.length) {
          return typesArray.some(
            (typeObj) => typeObj && typeIds.includes(typeObj.resource_type_id) // Check against multiple type IDs
          );
        }
        return false;
      };

      const filtered_Resources = All_Resources.filter((item) =>
        containsType(item.types, type_ids)
      );

      // console.log("filtered_Resources -----------", filtered_Resources);

      res.send(filtered_Resources);
    }
  } catch (err) {
    console.error("Error get_All_Resources_filtered:", err);

    res.send(err.message);
    next(err);
  }
}

async function getAllResourceType(req, res, next) {
  try {
    const AllResourceType = await get_All_Resource_Type_model();
    if (AllResourceType) {
      res.send(AllResourceType);
    }
  } catch (err) {
    console.error("Error getAllResourceType:", err);

    res.sand(err.message);
    next(err);
  }
}

async function Count_From_Same_Type(req, res, next) {
  console.log("Count_From_Same_Type");

  try {
    const AllResourceType = await get_All_Resource_Type_model(); // bring the Resource Types
    const All_Resource_Type_plus_count =
      await Make_Array_to_count_Resorce_by_type(AllResourceType);

    // console.log("All_Resource_Type_plus_count" , All_Resource_Type_plus_count);
    //   const resourcesQuery  = await DBConnection('resource_type')
    //   .select('resource_type_id','resource_type_name','description_short')
    //  if (resourcesQuery){return resourcesQuery}

    // const Count_From_Same_Type = await  Count_From_Same_Type_model(AllResourceType ,All_Resources);
    res.send(All_Resource_Type_plus_count);

    // if(AllResourceType){   res.send(AllResourceType);}
  } catch (err) {
    console.error("Error Count_From_Same_Type:", err);

    res.sand(err.message);
    next(err);
  }
}

async function post_many_new_resource(req, res, next) {
  console.log(" post_many_new_resource", req.body);

  const {
    item_tool_list,
    item_types_list,
    description,
    monitoring,
    resource_string,
  } = req.body;
  let array_of_resource_strings = [];

  if (resource_string.includes(",")) {
    array_of_resource_strings = resource_string.split(","); // Convert to array
    array_of_resource_strings = array_of_resource_strings.filter(
      (item) => item.trim() !== ""
    ); // delete emptys

    console.log("array_of_resource_strings", array_of_resource_strings);
  } else {
    array_of_resource_strings = [resource_string]; // Otherwise, make it an array with one item
  }

  try {
    const results = []; // Store results for each posted resource

    for (const resource of array_of_resource_strings) {
      const posted_id = await post_new_resource_model(
        item_tool_list,
        item_types_list,
        description,
        monitoring,
        resource
      );

      if (posted_id) {
        console.log("posted", posted_id);
        const [the_new_item] = await DBConnection("all_resources")
          .select("*")
          .where("resource_id", "=", posted_id);

        if (the_new_item) {
          results.push(the_new_item); // Add the new item to results
        }
      }
    }

    if (results.length > 0) {
      console.log("all results -------------- ", results);
      return res.status(200).send(results); // Send all results
    }

    res.status(500).send("Error in inserting resource");
  } catch (err) {
    console.error(err.message);
    next(err); // Call next with the error to handle it in a centralized error handler
  }
}

async function post_new_resource(req, res, next) {
  console.log(" post_new_resource", req.body);

  const {
    item_tool_list,
    item_types_list,
    description,
    monitoring,
    resource_string,
    parent_id,
  } = req.body;
  try {
    const posted_id = await post_new_resource_model(
      item_tool_list,
      item_types_list,
      description,
      monitoring,
      resource_string,
      parent_id
    );

    if (posted_id) {
      console.log("posted", posted_id);
      const the_new_item = await DBConnection("all_resources")
        .select("*")
        .where("resource_id", "=", posted_id);
      if (the_new_item) {
        return res.status(200).send(the_new_item);
      }
    }

    // If posted is false or any other issue, you can send an error response
    res.status(500).send("Error in inserting resource");
  } catch (err) {
    console.error(err.message);
    next(err); // Call next with the error to handle it in a centralized error handler
  }
}

async function edit_resource(req, res, next) {
  console.log("edit_resource");
  console.log(req.body);
  const { resource_id } = req.body;
  const { monitoring } = req.body;
  const { description } = req.body;
  const { item_tool_list } = req.body;
  const { item_types_list } = req.body;

  try {
    const put = await DBConnection("all_resources")
      .where({ resource_id: resource_id })
      .update({
        resource_string: req.body?.resource_string,
        type: item_types_list.toString(),
        tools: item_tool_list.toString(),
        description: description,
        monitoring: monitoring,
      });

    if (put) {
      console.log("put-----------------", put);
      const the_new_item = await DBConnection("all_resources")
        .select("*")
        .where("resource_id", "=", resource_id);
      console.log("the_new_item1-----------------", the_new_item);
      if (the_new_item) {
        console.log("the_new_item2-----------------", the_new_item);

        return res.status(200).send(the_new_item); // Ensure response is sent and function exits
      }
    }
    // If no new item is found, send a different response
    return res.status(404).send("Resource not found or not updated");
  } catch (err) {
    console.error("Error in edit_resources",error);
    res.send(err.message);
    return res.status(500).send(err.message);

    //   console.log("error in edit asset ",err);

    // res.send(err.message)
    // return res.status(500).send(err.message);
    //     res.status(500).send(err.message);
  }
}

async function delete_single_resource(req, res, next) {
  const { resource_id } = req.params;

  if (resource_id === undefined || resource_id === null || resource_id === "") {
    res.sand("no id");
    return "no id";
  }

  try {
    const is_exist = await check_if_id_exist_in_db(resource_id);
    if (is_exist) {
      const deleted = await delete_single_resource_by_id(resource_id);
      res.send(deleted);
    } else {
      res.sand("now such id in db");
      return;
    }
  } catch (err) {
    // res.sand(err.message)
    // next(err);
    console.error(err);
  }
}

async function UpdateMonitorSingle(req, res, next) {
  try {
    console.log("UpdateMonitorSingle", req.body);
    const up = await UpdateMonitorSingleModal(
      req.body?.resource_id,
      req.body?.value
    );
    res.send(up);
  } catch (error) {
    console.error("error in UpdateMonitorSingle", error);
  }
}
async function UpdateMonitorMulti(req, res, next) {
  try {
    console.log("UpdateMonitorSingle", req.body);
    const up = await UpdateMonitorMultiModal(
      req.body?.ids?.join('","'),
      req.body?.value
    );
    res.send(up);
  } catch (error) {
    console.error("error in UpdateMonitorSingle", error);
  }
}

async function getResourceToModuleObj(req, res, next) {
  try {
    const all_Modules = await get_all_Modules_model();
    // console.log(all_Modules);

    const obj = {};
    await all_Modules?.Modules?.forEach(async (x) => {
      const AssetArr = await GetAllModuleAssignedResources(x?.tool_id);
      // console.log(x.Tool_name, "1111111111111tttttttttt");

      obj[x.Tool_name] = AssetArr;
      // console.log(obj, "444444444");
    });

    res.send(obj);
  } catch (error) {
    console.error("error in UpdateMonitorSingle", error);
  }
}

async function getFullCategoryAndEntitiesList(req, res, next) {
  try {
    console.log("getFullCategoryAndEntitiesList");
    const arr = await getFullCategoryAndEntitiesListModal();
    // console.log(arr[0], "arr[0]?.objFull", arr[0], "leigh");

    let tmpArray = ["Users", "Endpoints", "Organization"];
    arr[0]?.objFull.forEach((z) => {
      const dateArr = [];
      z?.entities?.forEach((w) => {
        const maxDate = Math.max(
          ...w?.properties.map((cur) => new Date(cur?.checked)?.getTime())
        );
        dateArr.push(maxDate ? maxDate : null);
        w.lastUpdated = maxDate ? maxDate : null;
      });
      const maxDateArr = Math.max(...dateArr);
      z.lastUpdated = maxDateArr ? maxDateArr : null;
    });

    const arrNew = tmpArray.map((x) => {
      if (arr[0]?.objFull.some((y) => y?.categoryName == x)) {
        return;
      } else {
        arr[0]?.objFull?.push({
          categoryName: x,
          entities: [],
          lastUpdated: null,
        });
      }
    });
    res.send(arr[0]?.objFull);
  } catch (error) {
    console.error("error in getFullCategoryAndEntitiesList", error);
  }
}

async function AddEntity(req, res, next) {
  try {
    console.log(req.body, " req.body of AddEntity");

    const bol = await AddEntityModal(req.body);
    if (bol) {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.error("Error in AddEntity : ", error);
    res.send(false);
  }
}
async function UpdateEntity(req, res, next) {
  try {
    console.log(req.body, " req.body of AddEntity");

    const bol = await UpdateEntityModal(req.body);
    if (bol) {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.error("Error in AddEntity : ", error);
    res.send(false);
  }
}

async function DeleteSingleEntity(req, res, next) {
  const { EntityId } = req.params;

  if (EntityId === undefined || EntityId === null || EntityId === "") {
    res.sand("no id");
    return "no id";
  }

  try {
    const deleted = await DeleteSingleEntityModal(EntityId);
    res.send(deleted);
  } catch (err) {
    // res.sand(err.message)
    // next(err);
    console.error(err);
  }
}

async function AddTagToResource(req, res, next) {
  try {
    const { id, tag } = req.body;
    const AddTagAction = await AddTagToResourceModal(id, tag);
    res.send(true);
  } catch (err) {
    console.error("Error in AddTagToResource", err);
  }
}

async function DeleteTagToResource(req, res, next) {
  try {
    const { id, tag } = req.body;
    const DeleteTagAction = await DeleteTagToResourceModal(id, tag);
    res.send({ newTags: DeleteTagAction });
  } catch (err) {
    console.error("Error in DeleteTagToResource", err);
  }
}

module.exports = {
  DeleteTagToResource,
  AddTagToResource,
  DeleteSingleEntity,
  UpdateEntity,
  AddEntity,
  getFullCategoryAndEntitiesList,
  getResourceToModuleObj,
  UpdateMonitorMulti,
  UpdateMonitorSingle,
  get_All_Resources,
  getAllResourceType,
  get_All_Resources_filtered,
  Count_From_Same_Type,
  post_new_resource,
  edit_resource,
  delete_single_resource,
  get_Same_Type,
  post_many_new_resource,
};
