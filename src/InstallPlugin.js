const fs = require('fs-extra');
const chalk = require('chalk');

const error = chalk.bold.bgRed;

module.exports = async function installPlugin({ config, pluginUrl }) {
  const pkg = fs.readJsonSync(config);
  const { craftPluginDownloader } = pkg;

  if (craftPluginDownloader == null) {
    return console.error(error('you must define a craftPluginDownloader key in your package.json'));
  }

  if (!craftPluginDownloader.plugins.includes(pluginUrl)) {
    craftPluginDownloader.plugins.push(pluginUrl);
  }

  try {
    await fs.writeJson(config, pkg, {
      spaces: 2,
    });
  } catch (error) {
    console.error(error);
  }
};
