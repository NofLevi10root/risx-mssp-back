/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("all_resources", (table) => {
    table.string("resource_id", 15).notNullable().unique().primary();
    table.string("resource_string", 255).notNullable();
    table.string("description");
    table.text("tools");
    table.string("type");
    table.string("resource_status");
    table.boolean("monitoring");
    table.string("parent_id", 500);
    table.timestamp("checked");
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    table.timestamp("updatedAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("all_resources");
};
