/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("alert_client_config", (table) => {
    table.string("label", 300).notNullable().unique().primary();
    table.json("client_id_population");
    table.json("fqdn_population");
    table.json("config");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("alert_client_config");
};
