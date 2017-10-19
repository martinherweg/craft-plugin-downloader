const fs = require('fs-extra');
const chalk = require('chalk');

const { downloadPlugin } = require('./helperFunctions/downloadPlugin');

const error = chalk.bold.bgRed;

module.exports = async function installPlugin({ config, pluginUrl, update = false }) {
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

    await downloadPlugin({
      url: pluginUrl,
      folders: {
        tmpFolder: craftPluginDownloader.tmpFolder,
        pluginFolder: craftPluginDownloader.pluginPath,
      },
      willUpdate: update,
    });
  } catch (error) {
    console.error(error);
  }
};
