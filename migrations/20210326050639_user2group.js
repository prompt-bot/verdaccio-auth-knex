
exports.up = async function (knex) {
  return knex.schema.createTable('user2group', function (table) {
    table.increments().primary();
    table.integer('user_id').unsigned()
    table.integer('group_id').unsigned()
    table.foreign('user_id').references('users.id');
    table.foreign('group_id').references('groups.id');
    table.unique(['user_id', 'group_id']);
    // table.timestamps();
  });
  // return knex.schema.alterTable('user2group', function(table) {
  //   table.unique(['user_id', 'group_id']);
  // })
};

exports.down = function(knex) {
  return knex.schema.dropTable('user2group');
};
