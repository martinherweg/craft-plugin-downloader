const yargs = require('yargs');
const chalk = require('chalk');
const findUp = require('find-up');

const installPlugin = require('../src/InstallPlugin');
const updatePlugins = require('../src/updatePlugins');
const installAllPlugins = require('../src/InstallAllPlugins');

const configPath = findUp.sync('package.json');
const config = require(configPath);

const cli = () => {
  const foo = yargs
    .command({
      command: 'install <url>',
      aliases: 'i',
      desc: 'Installs a Plugin via it\'s Github Repo URL for example https://github.com',
      builder: yargs =>
        yargs.positional('url', {
          describe: 'A Github Repo URL',
        }),
    })
    .command({
      command: 'all',
      aliases: 'a',
      desc: 'Installs all Plugins defined in the config File.',
    })
    .command('update', 'Gets list of installed Plugins via package.json and lists them so you can check of which you want to update')
    .demandCommand(1, chalk`{bgRed You must at least specify one command to move on}`)
    .help('h')
    .alias('h', 'help').argv;

  if (foo._[0] === 'install') {
    installPlugin({
      config: configPath,
      pluginUrl: foo.url,
    });
  } else if (foo._[0] === 'update') {
    updatePlugins({ config: configPath });
  } else if (foo._[0] === 'all') {
    installAllPlugins({ config: configPath });
  }
};
module.exports = cli;
