const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {};

// Import individual model files
db.User = require('./User')(sequelize);
db.Child = require('./Child')(sequelize);
db.Vaccine = require('./Vaccine')(sequelize);
db.ChildVaccine = require('./ChildVaccine')(sequelize);
db.Notification = require('./Notification')(sequelize);
db.PasswordResetToken = require('./PasswordResetToken')(sequelize);

// Run associate definitions
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
