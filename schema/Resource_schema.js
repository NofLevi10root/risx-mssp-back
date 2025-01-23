const post_resource_schema = {
  type: "object",
  properties: {
    // resource_id: {type: "string"},
    resource_string: { type: "string", minLength: 3 },
    monitoring: { type: "boolean" },
    description: { type: "string" },
    item_tool_list: { type: "array" },
    item_types_list: { type: "array", minItems: 1 },
    parent_id: { type: "string" },
    //   foo: {type: "integer"},
  },

  required: ["resource_string"],
  additionalProperties: true,
};

const post_many_resources_schema = {
  type: "object",
  properties: {
    // resource_id: {type: "string"},
    resource_string: { type: "string", minLength: 3 },
    monitoring: { type: "boolean" },
    description: { type: "string" },
    item_tool_list: { type: "array" },
    // item_types_list: {type: "array" ,"minItems": 1},
    //   foo: {type: "integer"},
  },

  required: ["resource_string"],
  additionalProperties: true,
};

module.exports = { post_resource_schema, post_many_resources_schema };
