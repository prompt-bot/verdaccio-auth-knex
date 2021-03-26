
exports.up = function(knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments().primary();
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
    table.timestamps();
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('users')
};
