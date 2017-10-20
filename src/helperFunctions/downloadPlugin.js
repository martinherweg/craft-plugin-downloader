const fs = require('fs-extra');
const download = require('download');
const ProgressBar = require('ascii-progress');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');

const readDirR = require('./readDir');
const { findPlugin } = require('./PluginHelpers');

/**
 * Function to Download the Plugin Files
 * @param pluginUrl
 * @returns {*|Promise.<T>}
 */
function downloadFile({ pluginUrl, folders, update }) {
  console.log(chalk`{blue Downloading {yellow ${pluginUrl}}}`);
  // construct the Plugin Url (just github)
  let pluginZip;
  if (pluginUrl.includes('.zip')) {
    pluginZip = pluginUrl;
  } else {
    pluginZip = `${pluginUrl}/archive/master.zip`;
  }
  // create an empty tmp dir
  fs.emptyDirSync(folders.tmpFolder);

  // use the donwload package which returns a promise to download the file
  // extract it to the tmpfolder
  /**
   * @param url (String)
   * @param destination (String)
   */
  return download(pluginZip, folders.tmpFolder, {
    extract: true,
    mode: '775',
  })
    .on('response', res => {
      const length = parseInt(res.headers['content-length'], 10);
      // initialize node-progress
      const bar = new ProgressBar({
        schema: '[:bar] :percent :elapseds :etas',
        filled: '*',
        total: length,
      });
      res.on('data', data => bar.tick(data.length));
      if (bar.completed) {
        console.log('Plugin successfully downloaded');
      }
    })
    .then(() => {
      // Recursive read all Files in the tmp Folder
      const files = readDirR(path.resolve(process.cwd(), folders.tmpFolder));
      // find the File which includes `Plugin.php` to get the Folder which contains the Plugin
      const PluginFile = files.find(dataItem => dataItem.includes('Plugin.php'));
      const PluginFileDirectory = path.dirname(PluginFile);
      // get the Folder name the Plugin is located in
      let PluginFolder = path.basename(PluginFileDirectory);
      // check again for the existence of the Plugin Folder and return if true
      if (fs.pathExistsSync(folders.pluginFolder + PluginFolder)) return;

      // if the plugin folder is located in the root it often contains -master from the zip
      // we replace it here
      if (PluginFolder.includes('-master')) {
        PluginFolder = PluginFolder.replace('-master', '');
      }
      // finally move the Plugin Folder to the Craft Plugin Folder with the name of the Plugin
      fs.moveSync(PluginFileDirectory, folders.pluginFolder + PluginFolder, {
        overwrite: update,
      });

      // Remove the Plugin Folder
      fs.removeSync(PluginFileDirectory);
      console.log(chalk`{green Plugin downloaded and extracted, please activate it in the Backend}`);
    })
    .catch(error => console.error(error));
}

/**
 * Doing all the Magic to Download the Plugin
 * @param pluginUrl (String)
 * @returns {Promise.<T>|*}
 */
async function downloadPlugin({ url, folders, willUpdate = false }) {
  const isInstalled = findPlugin({ pluginUrl: url, folders });
  // if there is an item return here so we don't download a installed plugin again.
  if (isInstalled !== undefined && isInstalled.length > 0 && !willUpdate) {
    try {
      await inquirer
        .prompt([
          {
            type: 'confirm',
            name: 'update',
            message: `Plugin ${url} is already installed.
            Do you want to update ${isInstalled}?`,
          },
        ])
        .then(answers => {
          if (answers.update) willUpdate = true;
        });
    } catch (e) {
      console.error(e);
    }

    if (!willUpdate) return console.log(chalk`{yellow Plugin will not get updated}`);
  }

  return downloadFile({
    pluginUrl: url,
    folders,
    update: willUpdate,
  });
}

exports.downloadPlugin = downloadPlugin;
