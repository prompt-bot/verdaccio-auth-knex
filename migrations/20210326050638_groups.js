
exports.up = function(knex) {
  return knex.schema.createTable('groups', function (table) {
    table.increments().primary();
    table.string('name').unique().notNullable();
    table.timestamps();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('groups');
};
