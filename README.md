# Craft Plugin Downloader
I've created this module for CraftCMS 2, because I found it rather annoying to download a plugins .zip file, extract it and copy to my project.

This module simplifies the process, so that you only need to type `yarn craft-plugin-downloader install <github repo url>` in your terminal and it will download the plugin, extract it and copy it to the defined CraftCMS plugin folder.

If you want a different version you could provide the URL to the .zip File.
For Example to download v1 of the Craft Element API Plugin you could use
```
yarn craft-plugin-downloader install https://github.com/craftcms/element-api/archive/v1.zip
```

If you don't use yarn, please see the explanation further down.

## Installation

with yarn
```
yarn add craft-plugin-downloader --dev
```

with npm
```
npm install craft-plugin-downloader --dev
```

Add this to your package.json

```
"craftPluginDownloader": {
    "plugins": [],
    "tmpFolder": "tmp/folder/for/the/download/",
    "pluginPath": "path/to/your/craft/plugins/folder/"
}
```

* `plugins`: All plugin URLs installed via this module are added to this array
* `tmpFolder`: Path to a temporary folder which holds the downlowed files
* `pluginPath`: Path to you CraftCMS plugin folder

`pluginPath` and `tmpFolder` are relative to your project root.


## Usage
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

## Known issues
Sometimes there is a problem with `node-progress` and you get an error like this
```
RangeError: Invalid array length
    at ProgressBar.render (/project/node_modules/craft-plugin-downloader/node_modules/progress/lib/node-progress.js:155:14)
    at ontimeout (timers.js:469:11)
    at tryOnTimeout (timers.js:304:5)
    at Timer.listOnTimeout (timers.js:264:5)
error Command failed with exit code 1.
```

If this error occurs please just repeat the command.
