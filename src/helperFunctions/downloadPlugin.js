const fs = require('fs-extra');
const download = require('download');
const ProgressBar = require('progress');
const chalk = require('chalk');

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
        overwrite: !!argv.update,
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
