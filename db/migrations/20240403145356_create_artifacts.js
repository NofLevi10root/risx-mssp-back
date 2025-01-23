/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('artifacts', table => {
        table.string('artifact_id',50).notNullable().unique().primary();  
        table.string('Toolname',100).notNullable().unique(); 
        table.string('parent_id',50); 
        table.string('BoxType',100);
        table.string('headline',100);
        table.string('description');
        table.boolean('isActive');
        table.boolean('ShowInUi');
        table.string('logoAddress_1',150);
        table.string('toolURL',150);
        table.string('readMoreAddress',150);
        table.text('readMoreText',150);
        table.string('buttonTitle',50);
        table.string('Status',100);
        table.string('ServicePackage',50);
        table.string('useResourceType');
        table.integer('positionNumber');
        table.timestamp('LastRun');
        table.integer('threshold_time',10);
        table.timestamp('createdAt').defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        table.json('arguments');
 
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('artifacts');
};
 