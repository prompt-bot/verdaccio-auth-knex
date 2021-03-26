const knex = require('knex')
const crypto = require('crypto')

/**
 * Custom Verdaccio Authenticate Plugin.
 */
class AuthCustomPlugin {
  constructor(config, options) {
    this.knexOptions = {
      client: config.client,
      connection: config.connection,
    }
    if (config.version) {
      this.knexOptions.version = config.version
    }
    // defined a password srcert
    this.password_secret = config.password_secret || '';
    this.logger = console; //options.logger
    return this;
  }

  hash (password) {
    if(this.password_secret.length === 0){
        return password;
    }
    const hashed = crypto.pbkdf2Sync(password, this.password_secret, 10000, 64, 'sha512');
    return hashed.toString('hex');
  }

  /**
   * Database initialize
   */
  async initialize () {
    this.knex = knex(this.knexOptions)
    await this.knex.migrate.latest()
  }

  // adduser(username, password, cb) {
  //   this.logger.info(`adduser: ${username}`)
  //   this.knex('users').insert({ username, password: this.hash(password) }).then(user => {
  //     if(user) {
  //       return cb(null, true)
  //     } else {
  //       return cb(null, false)
  //     }
  //   })
  // }

  /**
   * Authenticate an user.
   * @param username user to log
   * @param password provided password
   * @param cb callback function
   */
  authenticate(username, password, cb) {
    if (!username || !password) {
      return cb(null, cb)
    }
    this.logger.info(`authenticate: ${username}`)
    this.knex.select('*')
      .table('users')
      .leftJoin('user2group', 'user2group.user_id', 'users.id')
      .leftJoin('groups', 'user2group.group_id', 'groups.id')
      .where('users.username', username)
      .where('users.password', this.knex.raw('?', this.hash(password)))
      .then(rel => {
        if (rel.length < 1 || rel[0].password !== this.hash(password)) {
          return cb(null, false)
        }
        const groups = rel.map(el => el.groupname)
        // console.log(groups)
        return cb(null, groups)
      })
  }

  changePassword(username, password, newPassword, cb) {
    this.logger.info(`changePassword: ${username}`)
    this.knex.select('*').table('users').where('username', username)
      then(user => {
        if(!user || user.password !== this.hash(password)) {
          return cb(null, false)
        }
        this.knex('users')
        .where('username', username)
        .update({ password: this.hash(newPassword) }).then(user => {
          if(user) {
            return cb(null, true);
          }
          return (null, false);
        })
      })
  }

  /**
   * check grants for such user.
   */
  // allow_access(user, pkg, cb) {
  //   console.log(user, pkg)
  //   cb(null, true);
    // in case of restrict the access
  // }

  // /**
  //  * check grants to publish
  //  */
  // allow_publish(user) {
  //   // in cass to check if has permission to publish
  // }

  // allow_unpublish(user) {

  // }
}

module.exports =  (config, options) => {
  const plugin = new AuthCustomPlugin(config, options);
  plugin.initialize();
  return plugin;
};
