# Craft Plugin Downloader
I've created this module for CraftCMS 2, because I found it rather annoying to download a plugins .zip file, extract it and copy to my project.

This module simplifies the process, so that you only need to type `yarn craft-plugin-downloader install <github repo url>` in your terminal and it will download the plugin, extract it and copy it to the defined CraftCMS plugin folder.

If you don't use yarn, please see the explanation further down.

## Installation

with yarn
```
yarn install craft-plugin-downloader --dev
```

with npm
```
npm install craft-plugin-downloader --dev
```

Add this to your package.json

```
"craftPluginDownloader": {
    "plugins": [],
    "tmpFolder": "tmp/folder/for/the/download",
    "pluginPath": "path/to/your/craft/plugins/folder"
}
```

* `plugins`: All plugin URLs installed via this module are added to this array
* `tmpFolder`: Path to a temporary folder which holds the downlowed files
* `pluginPath`: Path to you CraftCMS plugin folder

`pluginPath` and `tmpFolder` are relative to your project root.


# Usage
The script provides three commands.
* `install <URL>` Install a CraftCMS plugin from a Github URL
* `update` Update all plugins listed in the `"plugins"` array within your package.json
* `all` Install all plugins listed in the `"plugins"` array within your package.json

For easier use, you can add these commands in the `scripts` part of your package.json.

```
"scripts": {
    "installPlugin": "craft-plugin-downloader install",
    "updatePlugins": "craft-plugin-downloader update",
    "installAllPlugins": "craft-plugin-downloader all"
}
```

Then use them like this
with npm
```
npm run installPlugin <URL to Github repo>
```

with yarn
```
yarn installPlugin <URL to Github repo>
```
