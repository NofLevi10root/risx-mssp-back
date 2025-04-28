const router = require("express").Router();

const ResourcesController = require("../controllers/ResourcesController");

const {
  validateBody,
  Check_if_website_name_exists_to_avoid_duplication,
  Check_if_website_id_exists,
  Check_if_resource_exists_to_avoid_duplication_for_post,
  Check_if_resource_exists_to_avoid_duplication_for_edit,
  Check_if_resource_id_exists_to_continue,
  Check_if_resource_exists_to_avoid_duplication_for_edit_entity,
  Check_if_resource_exists_to_avoid_duplication_for_post_entity,
} = require("../middleware/ResourcesMiddleware");
const {
  post_resource_schema,
  post_many_resources_schema,
} = require("../schema/Resource_schema");

router.get("/", ResourcesController.get_All_Resources); //get all the Resources
router.get(
  "/getFullCategoryAndEntitiesList",
  ResourcesController.getFullCategoryAndEntitiesList
); //get all the Resources new with category and entities

router.get(
  "/getResourceToModuleObj",
  ResourcesController.getResourceToModuleObj
); //get all the Resources

router.get("/same-type", ResourcesController.get_Same_Type); //get all from Same Type

router.get(
  "/all-resource-filtered",
  ResourcesController.get_All_Resources_filtered
); //get All Resources filtered

router.get("/all-resource-type", ResourcesController.getAllResourceType); //get resource type

router.get("/count-same-type", ResourcesController.Count_From_Same_Type); // COUNT TIMES SAME RESOURCE TYPE EXISTING IN TABLE

router.post(
  "/",
  [validateBody(post_resource_schema)],
  Check_if_resource_exists_to_avoid_duplication_for_post,
  ResourcesController.post_new_resource
);

router.post(
  "/",
  [validateBody(post_resource_schema)],
  Check_if_resource_exists_to_avoid_duplication_for_post,
  ResourcesController.post_new_resource
);

router.post(
  "/many",
  [validateBody(post_many_resources_schema)],
  ResourcesController.post_many_new_resource
);

router.put(
  "/",
  [validateBody(post_resource_schema)],
  Check_if_resource_id_exists_to_continue,
  Check_if_resource_exists_to_avoid_duplication_for_edit,
  ResourcesController.edit_resource
);
router.put(
  "/UpdateMonitorSingle",
  Check_if_resource_id_exists_to_continue,
  ResourcesController.UpdateMonitorSingle
);
router.put("/UpdateMonitorMulti", ResourcesController.UpdateMonitorMulti);

router.delete("/:resource_id", ResourcesController.delete_single_resource); //delete_single resource
router.delete("/Entity/:EntityId", ResourcesController.DeleteSingleEntity); //delete_single Entity

//  router.post('/',[validateBody(websiteSchema),  Check_if_website_name_exists_to_avoid_duplication] , ResourcesController.postNew_website);

//  router.delete('/:id',[Check_if_website_id_exists] , ResourcesController.delete_website);

//  router.get('/default-columns',ResourcesController.getDefaultColumns);

router.post(
  "/AddEntity",
  Check_if_resource_exists_to_avoid_duplication_for_post_entity,
  ResourcesController.AddEntity
);

router.put(
  "/UpdateEntity",
  Check_if_resource_exists_to_avoid_duplication_for_edit_entity,
  ResourcesController.UpdateEntity
);

router.post("/AddTagToResource", ResourcesController.AddTagToResource);
router.post("/DeleteTagToResource", ResourcesController.DeleteTagToResource);

module.exports = router;
