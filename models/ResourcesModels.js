// const DatabaseError = require('../errors/DatabaseError');
const fs = require("fs");
const fs_promises = require("fs").promises; // Import 'fs' with Promise-based API
const path = require("path");
const pathToTmpJson = path.resolve(
  __dirname,
  "../tmpjsons/ResourceGroup-websites.json"
);
const DBConnection = require("../db.js");
const { exec } = require("child_process");
const { v4: uuid } = require("uuid");

async function get_single_resource_by_id(resource_id) {
  if (!resource_id) {
    console.log("problem no resource_id");
  }

  try {
    console.log("get_single_resource_by_id");

    const single = await DBConnection("all_resources")
      .select("*")
      .where("resource_id", "=", resource_id);

    if (single) {
      return single;
    }
  } catch (err) {
    console.log("get_All_Resources_model err", err);
  }
}

async function post_new_resource_model(
  item_tool_list,
  item_types_list,
  description,
  monitoring,
  resource_string,
  parent_id
) {
  console.log(" post_new_resource_model");

  try {
    const id = uuid();
    console.log("id", id);
    const id_short = id.replace(/-/g, "").substring(0, 9);
    console.log("id_short", id_short);
    const id_with_r = "r" + id_short;
    console.log("id_with_r", id_with_r);
    const posted = await DBConnection("all_resources").insert({
      resource_id: id_with_r,
      resource_string: resource_string,
      type: item_types_list.toString(),
      tools: item_tool_list.toString(),
      description: description,
      monitoring: monitoring,
      parent_id: parent_id,
    });

    return id_with_r;
  } catch (err) {
    console.log(err.message);
    // next(err); // Call next with the error to handle it in a centralized error handler
  }
}

async function get_config_path_model() {
  try {
    const configFileName = `config.json`;

    // let directory;
    let path_to_config;

    if (process.env.NODE_ENV === "development") {
      path_to_config = path.join(
        __dirname,
        "..",
        "..",
        "risx-mssp-front",
        `public`,
        configFileName
      );
      return path_to_config;
    } else if (process.env.NODE_ENV === "production") {
      path_to_config = path.join(
        __dirname,
        "..",
        "..",
        "risx-mssp-front-build",
        configFileName
      );
      return path_to_config;
    }
  } catch (err) {
    console.error("Error reading or parsing file:", err);
  }
}

async function read_config_model(file_path) {
  try {
    const data = await fs_promises.readFile(file_path, "utf8");
    const jsonData = JSON.parse(data);

    return jsonData;
  } catch (err) {
    console.error("Error reading file:", err);
    throw err; // Rethrow the error
  }
}

async function get_All_Resources_model() {
  try {
    // Fetch all resource_type_ids
    const resource_types = await DBConnection("resource_type").select(
      "resource_type_id"
    );

    // Fetch all resources
    const resourcesQuery = DBConnection("all_resources")
      .select(
        "all_resources.resource_id",
        "all_resources.resource_string",
        "all_resources.description",
        "all_resources.resource_status",
        "all_resources.monitoring",
        "all_resources.parent_id",
        "all_resources.checked",
        "all_resources.updatedAt",
        "all_resources.type",
        DBConnection.raw(
          'JSON_ARRAYAGG(JSON_OBJECT("Toolid", tools.tool_id, "toolname", tools.Tool_name)) as tools'
        )
      )
      .leftJoin("tools", function () {
        this.on(
          DBConnection.raw(
            'FIND_IN_SET(tools.tool_id, REPLACE(all_resources.tools, " ", ""))'
          )
        );
      })
      .groupBy("all_resources.resource_id");

    const [resources] = await Promise.all([resourcesQuery]);

    // Initialize the final object with all resource_type_ids as keys
    const groupedResources = resource_types.reduce((acc, resourceType) => {
      acc[resourceType.resource_type_id] = [];
      return acc;
    }, {});

    // Group resources by their type
    resources.forEach((resource) => {
      const typeIds = resource.type.split(",");
      typeIds.forEach((typeId) => {
        if (groupedResources[typeId]) {
          groupedResources[typeId].push({
            ...resource,
          });
        }
      });
    });

    // Log each resource_type_id for debugging purposes
    // resource_types.forEach(resourceType => {
    //   console.log("resource_type_id:", resourceType.resource_type_id);
    // });

    // console.log("groupedResources",groupedResources);
    return groupedResources;
  } catch (err) {
    console.log("get_All_Resources_model err", err);
  }

  // try {
  //   const resourcesQuery = DBConnection('all_resources')
  //   .select('all_resources.resource_id', 'all_resources.resource_string', 'all_resources.description', 'all_resources.resource_status', 'all_resources.monitoring', 'all_resources.parent_id', 'all_resources.checked', 'all_resources.updatedAt',
  //     DBConnection.raw('JSON_ARRAYAGG(JSON_OBJECT("Toolid", tools.tool_id, "toolname", tools.Tool_name)) as tools'),
  //     DBConnection.raw('(SELECT JSON_ARRAYAGG(JSON_OBJECT("resource_type_id", resource_type.resource_type_id, "resource_type_name", resource_type.resource_type_name)) FROM (SELECT DISTINCT resource_type.resource_type_id, resource_type.resource_type_name FROM resource_type WHERE FIND_IN_SET(resource_type.resource_type_id, all_resources.type)) AS resource_type) AS types')
  //   )
  //   .leftJoin('tools', function () {
  //     this.on(DBConnection.raw('FIND_IN_SET(tools.tool_id, REPLACE(all_resources.tools, " ", ""))'));
  //   })
  //   .groupBy('all_resources.resource_id');

  //   const [resources    ] = await Promise.all([resourcesQuery ]);
  //   if (resources){return resources}
  //   // res.send(resources);
  // } catch (err) {
  //   console.log("get_All_Resources_model err",err);
  // }
}

async function get_Same_Type_model(asset_type_id) {
  if (!asset_type_id) {
    console.log("asset_type_id is ", asset_type_id, "in get_Same_Type_model");
    return;
  }

  try {
    const resourcesQuery = DBConnection("all_resources")
      .select(
        "all_resources.resource_id",
        "all_resources.resource_string",
        "all_resources.description",
        "all_resources.resource_status",
        "all_resources.monitoring",
        "all_resources.parent_id",
        "all_resources.checked",
        "all_resources.updatedAt",
        "all_resources.type",
        DBConnection.raw(
          'JSON_ARRAYAGG(JSON_OBJECT("Toolid", tools.tool_id, "toolname", tools.Tool_name)) as tools'
        )
      )
      .leftJoin("tools", function () {
        this.on(
          DBConnection.raw(
            'FIND_IN_SET(tools.tool_id, REPLACE(all_resources.tools, " ", ""))'
          )
        );
      })
      .where("all_resources.type", asset_type_id) // Filter for type equal to -- asset_type_id
      .groupBy("all_resources.resource_id");

    const [resources] = await Promise.all([resourcesQuery]);

    return resources;
  } catch (err) {
    console.log("get_Same_Type_model error:", err);
    throw err; // Optionally rethrow the error to propagate it further
  }
}

async function get_All_Resource_Type_model() {
  // console.log("get_All_Resource_Type_model 11111111111111");

  try {
    const resourcesQuery = await DBConnection("resource_type").select(
      "resource_type_id",
      "resource_type_name",
      "description_short",
      "preview_name",
      "category_name"
    );
    if (resourcesQuery) {
      return resourcesQuery;
    }
  } catch (err) {
    console.log("get_All_Resource_Type_model", err);
  }
}

async function Count_From_Same_Type_model(AllResourceType, All_Resources) {
  // console.log("Count_From_Same_Type_model" ,All_Resources);
  try {
    console.log(AllResourceType);
    for (let j = 0; j < All_Resources.length; j++) {
      const xxx = All_Resources[j]?.types;
      console.log("xxx", xxx);
    }

    // מכין אריי של סוגי ריסוריס [2001,2002,2003[
    const type_ids_list = [];
    for (let i = 0; i < AllResourceType.length; i++) {
      const type_id = AllResourceType[i]?.resource_type_id;
      type_ids_list.push(type_id);
    }

    console.log("type_ids_list", type_ids_list);

    return "Shoko Banana";
  } catch (err) {
    console.log("Count_From_Same_Type_model", err);
  }
}

async function Make_Array_to_count_Resorce_by_type(AllResourceType) {
  try {
    const resourcesCount = await DBConnection("all_resources").select("type");

    const list_tagged_types = [];

    resourcesCount.forEach((element) => {
      if (element?.type === null) {
        return;
      }
      const type = element?.type.split(",").map((tag) => tag.trim());

      list_tagged_types.push(...type);
    });

    AllResourceType.forEach((element) => {
      if (element?.resource_type_id === null) {
        return;
      }
      const type_id = element?.resource_type_id;
      const count = list_tagged_types.filter((item) => item === type_id).length; // 6
      element.count = count;
    });
    return AllResourceType;
  } catch (err) {
    console.log("get_All_Resource_Type_model_00", err);
  }
}

async function check_if_string_exist_in_db_old(
  resource_string,
  item_types_list
) {
  try {
    if (resource_string == undefined || resource_string == null) {
      return null;
    }
    if (
      item_types_list == undefined ||
      item_types_list == null ||
      item_types_list.length === 0
    ) {
      return null;
    }

    // item_types_list.forEach((item_type) =>

    //   );

    const exist = await DBConnection("all_resources")
      .select("resource_string")
      .where("resource_string", "=", resource_string)
      .where("type", "=", item_type);
    if (exist?.length === 0) {
      console.log("no exist");
      return false;
    } else if (exist?.length != 0) {
      console.log("exist");
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

async function check_if_string_exist_in_db(resource_string, item_types_list) {
  try {
    // Validate inputs
    if (!resource_string || !item_types_list || item_types_list.length === 0) {
      return null;
    }

    // Iterate over each item type and check if the resource string exists
    for (const item_type of item_types_list) {
      const exist = await DBConnection("all_resources")
        .select("resource_string")
        .where("resource_string", "=", resource_string)
        .where("type", "=", item_type);

      if (exist.length > 0) {
        console.log("exist");
        return true;
      }
    }

    console.log("no exist");
    return false;
  } catch (err) {
    console.error(err);
    return false; // Consider what should be returned in case of an error
  }
}

async function check_if_id_exist_in_db(resource_id) {
  console.log("resource_id", resource_id);
  try {
    if (resource_id == undefined || resource_id == null) {
      return null;
    }

    const exist = await DBConnection("all_resources")
      .select("resource_id")
      .where("resource_id", "=", resource_id);
    if (exist?.length === 0) {
      console.log("no exist");
      return false;
    } else if (exist?.length != 0) {
      console.log("exist");
      return true;
    }
  } catch (err) {
    console.log(err);
  }
}

async function delete_single_resource_by_id(resource_id) {
  console.log("delete_single_resource_by_id", resource_id);

  try {
    const deleted = await DBConnection("all_resources")
      .where("resource_id", "=", resource_id)
      .del();

    if (deleted) {
      console.log("no exist", deleted);
      return true;
    } else {
      console.log("exist", deleted);
      return false;
    }
  } catch (err) {
    console.log(err);
  }
}

async function UpdateMonitorSingleModal(id, val) {
  try {
    console.log("id, val", id, val);
    const updated = await DBConnection.raw(
      `UPDATE all_resources set monitoring = ${val} where resource_id = "${id}" `
    );
    return true;
  } catch (error) {
    console.log("error in UpdateMonitorSingleModal ", error);
    return false;
  }
}

async function UpdateMonitorMultiModal(id, val) {
  try {
    console.log("id, val", id, val);
    const updated = await DBConnection.raw(
      `UPDATE all_resources set monitoring = ${val} where parent_id in ("${id}") `
    );
    return true;
  } catch (error) {
    console.log("error in UpdateMonitorMultiModal ", error);
    return false;
  }
}

async function GetAllModuleAssignedResources(id) {
  try {
    const [arr] = await DBConnection.raw(
      `SELECT resource_id,resource_string,checked,monitoring FROM all_resources where tools like "%${id}%"`
    );
    return arr;
  } catch (error) {
    console.log(error);
  }
}

async function getFullCategoryAndEntitiesListModal(id) {
  try {
    const [arr] = await DBConnection.raw(
      `SELECT 
      json_arrayagg(
          json_object(
              'categoryName', grouped_entities.category_type,
              'entities', grouped_entities.entities_agg
          )
      ) AS objFull
  FROM (
      SELECT 
          e.category_type,
          json_arrayagg(
              json_object(
                  'entitiesId', e.entities_id,
                  'entityName', e.entity_name,
                  'role', e.role,
                  'organization', e.organization,
                  'department', e.department,
                  'description', e.description,
                  'highProfile', e.high_profile,
                  'properties', COALESCE(ar.properties_agg, JSON_ARRAY()),
                  'categoryName', e.category_type
              )
          ) AS entities_agg
      FROM entities e
      LEFT JOIN (
          SELECT 
              parent_id,
              json_arrayagg(
                  json_object(
                      'resource_id', resource_id,
                      'resource_string', resource_string,
                      'description', description,
                      'tools', (
                          SELECT JSON_ARRAYAGG(
                              JSON_OBJECT(
                                  'Toolid', tools.tool_id, 
                                  'toolname', tools.Tool_name
                              )
                          )
                          FROM all_resources
                          LEFT JOIN tools ON FIND_IN_SET(tools.tool_id, REPLACE(all_resources.tools, " ", ""))
                          WHERE tt.resource_id = resource_id
                          GROUP BY all_resources.resource_id
                      ),
                      'type', type,
                      'resource_status', resource_status,
                      'monitoring', monitoring,
                      'parent_id', parent_id,
                      'checked', checked,
                      'createdAt', createdAt,
                      'updatedAt', updatedAt
                  )
              ) AS properties_agg
          FROM all_resources as tt
          GROUP BY parent_id
      ) ar ON e.entities_id = ar.parent_id
      GROUP BY 
          e.category_type
  ) AS grouped_entities;
  
   `
    );
    if (!arr[0]?.objFull?.length > 0) {
      return [{ objFull: [] }];
    }
    return arr;
  } catch (error) {
    console.log(error);
  }
}

async function AddEntityModal(data) {
  try {
    console.log(data, "AddEntityModal");

    const raw =
      await DBConnection.raw(`insert into entities ( entity_name, role, organization, department, description, high_profile, category_type) values
    ("${data.entityName}","${data.role}","${data.organization}","${data.department}","${data.description}",${data.highProfile},"${data.categoryName}")`);

    return true;
  } catch (error) {
    console.log("Error in AddEntityModal : ", error);
    return false;
  }
}

async function UpdateEntityModal(data) {
  try {
    console.log(data, "AddEntityModal");

    const raw =
      await DBConnection.raw(`update entities set  entity_name="${data.entityName}", role="${data.role}",
         organization="${data.organization}", department="${data.department}", description="${data.description}",
          high_profile=${data.highProfile} where entities_id = "${data.entitiesId}"`);

    return true;
  } catch (error) {
    console.log("Error in AddEntityModal : ", error);
    return false;
  }
}

async function DeleteSingleEntityModal(EntityId) {
  console.log("delete_single_resource_by_id", EntityId);

  try {
    const deleted1 = await DBConnection.raw(
      `delete from entities where entities_id = "${EntityId}"`
    );
    const deleted2 = await DBConnection.raw(
      `delete from all_resources where parent_id like "%${EntityId}%"`
    );
    console.log("deleted2,deleted2,deleted2", deleted2);

    if (deleted1) {
      console.log("no exist", deleted1);
      return true;
    } else {
      console.log("exist", deleted1);
      return false;
    }
  } catch (err) {
    console.log(err);
  }
}

async function GetAllEntitiesAndAssetsModal() {
  try {
    const [entities] = await DBConnection.raw("SELECT * FROM entities");
    const [Assets] = await DBConnection.raw(
      "SELECT  resource_string, description, tools, type, resource_status, monitoring, parent_id FROM all_resources"
    );
    return [entities, Assets];
  } catch (error) {
    console.log("Error GetAllEntitiesAndAssetsModal : ", error);
  }
}

async function AddTagToResourceModal(id, tag) {
  try {
    let TableName = "tools";
    let IdField = "tool_id";
    if (id?.startsWith("100")) {
      TableName = "artifacts";
      IdField = "artifact_id";
    }
    const ResTags = await DBConnection.raw(
      `update ${TableName} set arguments = json_array_append(arguments,"$.tags","${tag}") where ${IdField} = '${id}';`
    );
    console.log("ResTags ResTags ResTags ResTags ResTags", ResTags);

    return true;
  } catch (error) {
    console.log("Error GetAllEntitiesAndAssetsModal : ", error);
  }
}

async function DeleteTagToResourceModal(id, tag) {
  try {
    let TableName = "tools";
    let IdField = "tool_id";
    if (id?.startsWith("100")) {
      TableName = "artifacts";
      IdField = "artifact_id";
    }
    const [ResTags] = await DBConnection.raw(
      `SELECT json_Extract(arguments,"$.tags") as a FROM ${TableName}  where ${IdField} = '${id}'
      `
    );
    console.log("ResTags ResTags ResTags ResTags ResTags", ResTags[0].a);
    const newTags = ResTags[0]?.a?.filter((rr) => rr != tag);
    console.log("newTags newTags newTags ", newTags?.join('","'));
    const [DelTags] = await DBConnection.raw(
      `update ${TableName} set arguments = JSON_SET(arguments,"$.tags",json_array(${
        newTags?.length ? `"${newTags?.join('","')}"` : ""
      })) where ${IdField} = '${id}'; `
    );

    return newTags;
  } catch (error) {
    console.log("Error GetAllEntitiesAndAssetsModal : ", error);
  }
}

module.exports = {
  DeleteTagToResourceModal,
  AddTagToResourceModal,
  GetAllEntitiesAndAssetsModal,
  DeleteSingleEntityModal,
  UpdateEntityModal,
  AddEntityModal,
  getFullCategoryAndEntitiesListModal,
  GetAllModuleAssignedResources,
  UpdateMonitorMultiModal,
  UpdateMonitorSingleModal,
  get_All_Resources_model,
  get_All_Resource_Type_model,
  Count_From_Same_Type_model,
  Make_Array_to_count_Resorce_by_type,
  check_if_string_exist_in_db,
  check_if_id_exist_in_db,
  delete_single_resource_by_id,
  get_config_path_model,
  read_config_model,
  get_Same_Type_model,
  post_new_resource_model,
  get_single_resource_by_id,
};
