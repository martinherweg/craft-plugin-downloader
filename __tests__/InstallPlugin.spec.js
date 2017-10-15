const InstallPlugin = require('../src/InstallPlugin');
const fs = require('fs-extra');

const pluginUrl = 'https://github.com';
const configPath = './__mocks__/package.json';

afterAll(() => {
  fs.writeJSONSync('./__mocks__/package.json', {
    craftPluginDownloader: {
      plugins: [],
      pluginPath: './dist/craft/plugins/',
    },
  });
});

beforeAll(async () => {
  await InstallPlugin({
    config: './__mocks__/package.json',
    pluginUrl,
  });
});

test('it adds the Plugin Url to an craftPlugins array in package.json', async () => {
  const pkg = fs.readJsonSync(configPath);
  expect(pkg.craftPluginDownloader.plugins).toContain(pluginUrl);
});

test('It extracts the plugin in the defined Plugin Folder', () => {});
