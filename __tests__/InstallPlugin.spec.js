const InstallPlugin = require('../src/InstallPlugin');
const fs = require('fs-extra');
const path = require('path');

const pluginUrl = 'https://github.com/aelvan/Imager-Craft';
const configPath = './__mocks__/package.json';
const mocksPath = path.resolve(__dirname, '../__mocks__/');

jest.mock('./dist/craft/plugins', () => {}, { virtual: true });

const mockPackage = {
  craftPluginDownloader: {
    plugins: [],
    tmpFolder: path.resolve(__dirname, '../__mocks__/tmp/'),
    pluginPath: `${path.resolve(__dirname, '../__mocks__/dist/craft/plugins/')}/`,
  },
};

afterAll(() => {
  fs.emptyDirSync(`${mocksPath}/tmp/`);
  fs.emptyDirSync(`${mocksPath}/dist/craft/plugins/`);
});

beforeAll(async () => {
  fs.emptyDirSync(`${mocksPath}/tmp/`);
  fs.emptyDirSync(`${mocksPath}/dist/craft/plugins/`);
  fs.outputJsonSync(`${mocksPath}/package.json`, mockPackage);
  await InstallPlugin({
    config: './__mocks__/package.json',
    pluginUrl,
  });
});

test('it adds the Plugin Url to an craftPlugins array in package.json', async () => {
  const pkg = fs.readJsonSync(configPath);
  expect(pkg.craftPluginDownloader.plugins).toContain(pluginUrl);
});

test('It extracts the plugin in the defined Plugin Folder', () => {
  expect(fs.pathExistsSync(`${mocksPath}/dist/craft/plugins/imager`)).toBeTruthy();
});
