/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("on_premise_velociraptor", (table) => {
    table.increments("order");

    table
      .string("config_id", 40)
      .defaultTo(knex.raw("(uuid())"))
      // .primary()
      .unique()
      .notNullable();

    table.string("config_name", 220).unique().notNullable();
    table.json("config");
    table.string("description", 1024);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("on_premise_velociraptor");
};
