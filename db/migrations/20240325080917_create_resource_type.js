/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("resource_type", (table) => {
    table.string("resource_type_id", 10).notNullable().unique().primary();
    table.string("resource_type_name", 100).notNullable().unique();
    table.string("preview_name");
    table.string("category_name", 100);
    table.string("description_short");
    table.text("description_long");
    table.timestamp("createdAt").defaultTo(knex.raw("CURRENT_TIMESTAMP"));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("resource_type");
};
