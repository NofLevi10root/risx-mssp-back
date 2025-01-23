/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('tools', table => {
        table.string('tool_id', 10).notNullable().unique().primary();
        table.string('Tool_name',100).notNullable().unique();

        table.string('BoxType',100);
        table.string('headline',100);
        table.boolean('isActive');
        table.boolean('ShowInUi');
        table.string('logoAddress_1',150);
        table.string('logoAddress_2',150);
        table.string('iconAddress',150);
        table.string('description_short');
        table.text('description_long');
        table.string('Status',100);
        table.string('buttonTitle',50);
        table.string('toolURL',150);
        table.string('toolType',150);
        table.string('ServicePackage',50);
        table.string('useResourceType');
        table.integer('positionNumber',10);
        table.timestamp('LastRun');
        table.integer('threshold_time');
        table.json('arguments');
        
        
 table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'))
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('tools');
};
