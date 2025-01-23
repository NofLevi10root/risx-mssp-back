/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("all_resources").del();
  await knex("all_resources").insert([
   
  ]);
};
