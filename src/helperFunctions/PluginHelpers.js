const fs = require('fs-extra');
const path = require('path');

/**
 * Check the Craft Plugin Folder for Installed Plugins and return the folder names as array
 * @param craftPluginFolder
 * @returns array
 */
function installedPlugins(craftPluginFolder) {
  fs.ensureDirSync(craftPluginFolder);
  return fs.readdirSync(craftPluginFolder).filter(file => fs.lstatSync(path.join(craftPluginFolder, file)).isDirectory());
}

/**
 * Find a Plugin in the Craft Plugins Folder and return its name
 * @param pluginUrl
 */
function findPlugin({ pluginUrl, folders }) {
  // Check the Craft Plugin folder for installed Plugins
  // Using fs to get all files in the Folder, returns array with all files
  // filter them for just the directories
  const installedPluginsList = installedPlugins(folders.pluginFolder);
  // split the given plugin url to get an array so we can get the plugin name by url
  let url = pluginUrl.split('/');
  // get the last element of the array (should be the name, maybe needs better check)
  // split the name by the dashes to replace those, then join the string and replace undescores
  // gets us a clean string we can work with
  url = url[url.length - 1]
    .split('-')
    .join('')
    .replace('_', '');
  // convert the url to all lower case and replace craft or cms or craftcms, now we should get the clean plugin name
  // which is also used in the plugin folder as Folder name
  url = url
    .toLowerCase()
    .replace(/(craft)(cms)*/gi, '')
    .trim();
  // find an item in the installedPlugins array which includes the string we just created
  const matcher = new RegExp(url, 'gi');
  const pluginName = installedPluginsList.find(item => item.match(matcher));

  return pluginName;
}

exports.installedPlugins = installedPlugins;
exports.findPlugin = findPlugin;
