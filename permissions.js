const Configuration = require("./config.js");

exports.checkPerms = (user, command) => {
  const config = Configuration.config;
  if (user.id == config.permissions.owner) {
    return true;
  }
  let roles = user.roles.cache;

  let usersRole =
    roles.reduce((found, userRole) => {
      if (found != null) {
        return found;
      }
      const ndx = config.permissions.roleIDs
        .split(",")
        .findIndex((id) => userRole.id == id);
      if (ndx != -1) {
        return config.permissions.roles.split(",")[ndx];
      }
      return null;
    }, null) ?? "user";
  let commandPerms = config.commands[command].permissions.split(",");
  if (commandPerms.includes(usersRole)) {
    return true;
  }

  return false;
};
