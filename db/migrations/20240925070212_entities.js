/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("entities", (table) => {
    table
      .string("entities_id", 40)
      .defaultTo(knex.raw("(uuid())"))
      .primary()
      .unique()
      .notNullable();
    table.string("entity_name", 120);
    table.string("role", 120);
    table.string("organization", 240);
    table.string("department", 240);
    table.string("description", 1024);
    table.boolean("high_profile");
    table.string("category_type", 100);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("entities");
};
