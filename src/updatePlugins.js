const fs = require('fs-extra');
const chalk = require('chalk');
const inquirer = require('inquirer');

const { downloadPlugin } = require('./helperFunctions/downloadPlugin');
const { installedPlugins } = require('./helperFunctions/PluginHelpers');

const error = chalk.bold.bgRed;

module.exports = async function updatePlugins({ config }) {
  const pkg = fs.readJsonSync(config);
  const { craftPluginDownloader } = pkg;

  if (craftPluginDownloader == null) {
    return console.error(error('you must define a craftPluginDownloader key in your package.json'));
  }

  try {
    const pluginList = await installedPlugins(craftPluginDownloader.pluginPath);

    console.log(pluginList);
    return inquirer
      .prompt([
        {
          type: 'checkbox',
          name: 'pluginList',
          message: 'Choose Plugins you want to update',
          choices: pluginList,
        },
      ])
      .then(answers => {
        const pluginUrls = {};
        answers.pluginList.map(plugin => {
          pluginUrls[plugin] = craftPluginDownloader.plugins.find(url => {
            // split the given plugin url to get an array so we can get the plugin name by url
            let checkUrl = url.split('/');
            // get the last element of the array (should be the name, maybe needs better check)
            // split the name by the dashes to replace those, then join the string and replace undescores
            // gets us a clean string we can work with
            checkUrl = checkUrl[checkUrl.length - 1]
              .split('-')
              .join('')
              .replace('_', '');
            // convert the checkUrl to all lower case and replace craft or cms or craftcms, now we should get the clean plugin name
            // which is also used in the plugin folder as Folder name
            checkUrl = checkUrl.toLowerCase().replace(/(craft)(cms)*/gi, '');
            return checkUrl.match(new RegExp(plugin, 'gi'));
          });
        });

        // loop through the object and delete the ones we could not match
        // display which could not match so the user could update them by hand
        for (const prop in pluginUrls) {
          if (pluginUrls[prop] === null || pluginUrls[prop] === undefined) {
            console.log(chalk`{red Plugin ${prop} could not correctly matched, please update by hand }`);
            delete pluginUrls[prop];
          }
        }

        // map all the object keys to the downloadPlugin Function
        return Promise.all(
          Object.keys(pluginUrls).map(url =>
            downloadPlugin({
              url: pluginUrls[url],
              folders: {
                tmpFolder: craftPluginDownloader.tmpFolder,
                pluginFolder: craftPluginDownloader.pluginPath,
              },
              willUpdate: true,
            }),
          ),
        )
          .then(() => {
            // If everything is downloaded remove the tmp Folder.
            console.log(chalk`{yellow updated all chosen Plugins}`);
          })
          .catch(e => console.error(e));
      });
  } catch (e) {
    console.error(e);
  }
};
