/**
 * Download Craft Plugins
 *
 * @package  generator-mh-boilerplate
 * @author   Martin Herweg <info@martinherweg.de>
 */

const inquirer = require('inquirer');
const download = require('download');
const ProgressBar = require('progress');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const argv = require('yargs').argv;
const extend = require('deep-extend');
const pkg = require('../package.json');

// path to tmp folder
const tmpFolder = path.resolve(__dirname, 'tmp');
// path to the craft plugin folder, defined in the package.json with fallback to the default folder if the setting is not there
const craftPluginFolder = `${path.resolve(__dirname, `../${pkg.distPaths.pluginFolder}`)}/` || path.resolve(__dirname, '../dist/craft/plugins/');

/**
 * Function to get a list with all files including those in subfolders in the given dir
 * @param dir (String)
 * @returns {Array.<T>}
 */
function readDirR(dir) {
  return fs.statSync(dir).isDirectory() ? Array.prototype.concat(...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f)))) : dir;
}

/**
 * Doing all the Magic to Download the Plugin
 * @param pluginUrl (String)
 * @returns {Promise.<T>|*}
 */
async function downloadPlugin(pluginUrl) {
  const isInstalled = findPlugin(pluginUrl);
  // if there is an item return here so we don't download a installed plugin again.
  if (isInstalled !== undefined && isInstalled.length > 0) {
    // set a willUpdate Variable to Check if the user wants to update the Plugin
    let willUpdate = false;

    // check if the script is called with --update flag
    // update will Update variable
    if (argv.update) {
      willUpdate = true;
    } else {
      console.log(chalk`{yellow Plugin ${isInstalled} is already installed}`);
    }

    // check if the user wants to install one single Plugin or uses the update Flag
    if (!argv.scripts && !argv.update) {
      try {
        await inquirer
          .prompt([
            {
              type: 'confirm',
              name: 'update',
              message: `Do you want to update ${isInstalled}?`,
            },
          ])
          .then(answers => {
            if (answers.update) willUpdate = true;
          });
      } catch (e) {
        console.error(e);
      }
    }
    if (!willUpdate) return;
  }

  return downloadFile(pluginUrl);
}

/**
 * Check the Craft Plugin Folder for Installed Plugins and return the folder names as array
 * @param craftPluginFolder
 * @returns array
 */
function installedPlugins(craftPluginFolder) {
  return fs.readdirSync(craftPluginFolder).filter(file => fs.lstatSync(path.join(craftPluginFolder, file)).isDirectory());
}

/**
 * Find a Plugin in the Craft Plugins Folder and return its name
 * @param pluginUrl
 */
function findPlugin(pluginUrl) {
  // Check the Craft Plugin folder for installed Plugins
  // Using fs to get all files in the Folder, returns array with all files
  // filter them for just the directories
  const installedPluginsList = installedPlugins(craftPluginFolder);
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
  url = url.toLowerCase().replace(/(craft)(cms)*/gi, '');
  // find an item in the installedPlugins array which includes the string we just created
  const pluginName = installedPluginsList.find(item => item.match(/url/gi));
  return pluginName;
}

/**
 * Function to Download the Plugin Files
 * @param pluginUrl
 * @returns {*|Promise.<T>}
 */
function downloadFile(pluginUrl) {
  console.log(chalk`{blue Downloading {yellow ${pluginUrl}}}`);
  // construct the Plugin Url (just github)
  let pluginZip;
  if (pluginUrl.includes('.zip')) {
    pluginZip = pluginUrl;
  } else {
    pluginZip = `${pluginUrl}/archive/master.zip`;
  }
  // create an empty tmp dir
  fs.emptyDirSync(tmpFolder);

  // initialize node-progress
  const bar = new ProgressBar('[:bar] :percent :etas', {
    complete: '=',
    incomplete: ' ',
    width: 20,
    total: 0,
  });

  // use the donwload package which returns a promise to download the file
  // extract it to the tmpfolder
  /**
   * @param url (String)
   * @param destination (String)
   */
  return download(pluginZip, tmpFolder, {
    extract: true,
    mode: '775',
  })
    .on('response', res => {
      bar.total = res.headers['content-length'];
      res.on('data', data => bar.tick(data.length));
    })
    .then(() => {
      // Recursive read all Files in the tmp Folder
      const files = readDirR(path.resolve(__dirname, tmpFolder));
      // find the File which includes `Plugin.php` to get the Folder which contains the Plugin
      const PluginFile = files.find(dataItem => dataItem.includes('Plugin.php'));
      const PluginFileDirectory = path.dirname(PluginFile);
      // get the Folder name the Plugin is located in
      let PluginFolder = path.basename(PluginFileDirectory);
      // check again for the existence of the Plugin Folder and return if true
      if (fs.pathExistsSync(craftPluginFolder + PluginFolder)) return;

      // if the plugin folder is located in the root it often contains -master from the zip
      // we replace it here
      if (PluginFolder.includes('-master')) {
        PluginFolder = PluginFolder.replace('-master', '');
      }

      // finally move the Plugin Folder to the Craft Plugin Folder with the name of the Plugin
      fs.moveSync(PluginFileDirectory, craftPluginFolder + PluginFolder, {
        overwrite: argv.update ? true : false,
      });

      // Remove the Plugin Folder
      fs.removeSync(PluginFileDirectory);
      console.log(chalk`{green Plugin downloaded and extracted, please activate it in the Backend}`);
    })
    .catch(error => console.error(error));
}

// if the command line has an option --scripts don't go any further
// here we check the package.json for an array of Links and download all of them with our Download Plugin Function
if (argv.scripts) {
  // Get all Plugin Urls and execute or downloadPlugin function
  return Promise.all(pkg.craftPlugins.map(x => downloadPlugin(x)))
    .then(() => {
      // If everything is downloaded remove the tmp Folder.
      fs.removeSync(tmpFolder);
      console.log(chalk`{red removed ${tmpFolder}}`);
    })
    .catch(e => console.error(e));
}

// if we call the script with --update flag return a list of all plugins and update the chosen one
if (argv.update) {
  // get an array with all plugin names to use them as choices for inquirer
  const pluginList = installedPlugins(craftPluginFolder);

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
        pluginUrls[plugin] = pkg.craftPlugins.find(url => {
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
      return Promise.all(Object.keys(pluginUrls).map(x => downloadPlugin(pluginUrls[x])))
        .then(() => {
          // If everything is downloaded remove the tmp Folder.
          fs.removeSync(tmpFolder);
          console.log(chalk`{red removed ${tmpFolder}}`);
        })
        .catch(e => console.error(e));
    });
}

// If the --scripts option is not present we get an Command Line Prompt to paste a Plugin Url
// we Use Inquirer.js which is also used by Yeoman
inquirer
  .prompt([
    {
      type: 'input',
      name: 'pluginUrl',
      message: 'Please provide the URL to the github Repo',
      validate(input) {
        if (!input.includes('github.com')) {
          console.error('Please provide a vald Github URL');
          return false;
        }
        return true;
      },
    },
  ])
  .then(async answers => {
    // get the current package.json so we can extend it with javascript
    const extendPkg = await fs.readJsonSync('./package.json');
    // if the craftPlugins array in the package.json does not contain the current Plugin
    // push the URL to the array
    if (!extendPkg.craftPlugins.includes(answers.pluginUrl)) {
      extendPkg.craftPlugins.push(answers.pluginUrl);
    }

    // write the new package.json
    try {
      await fs.writeJsonSync('./package.json', extendPkg, {
        spaces: 2,
      });
    } catch (e) {
      console.error(e);
    }
    // download the Plugin
    downloadPlugin(answers.pluginUrl);
  })
  .catch(e => console.error(e));
