const fs = require('fs-extra');
const chalk = require('chalk');

const { downloadPlugin } = require('./helperFunctions/downloadPlugin');

const error = chalk.bold.bgRed;

module.exports = async function installAllPlugins({ config }) {
  const pkg = fs.readJsonSync(config);
  const { craftPluginDownloader } = pkg;

  if (craftPluginDownloader == null) {
    return console.error(error('you must define a craftPluginDownloader key in your package.json'));
  }

  const pluginList = craftPluginDownloader.plugins;

  try {
    return Promise.all(
      pluginList.map(plugin =>
        downloadPlugin({
          url: plugin,
          folders: {
            tmpFolder: craftPluginDownloader.tmpFolder,
            pluginFolder: craftPluginDownloader.pluginPath,
          },
          willUpdate: true,
        }),
      ),
    );
  } catch (error) {
    console.error(error);
  }
};
