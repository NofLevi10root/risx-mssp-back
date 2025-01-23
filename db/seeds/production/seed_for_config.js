const { log } = require('console');
const fs = require('fs');  // Import 'fs' with Promise-based API
const path = require('path');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
 

  exports.seed = async function(knex) {

    const filePath = path.join(__dirname, '..','production', 'config_seed.json');
    const configData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    await knex('configjson').del()
    await knex('configjson').insert({
      config: JSON.stringify(configData),
      lastupdated:new Date
    });  
  };