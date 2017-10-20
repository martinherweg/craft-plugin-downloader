# Craft Plugin Downloader
I created this module for Craft CMS 2 because I found it rather annoying to download a Plugins .zip File, extract it and copy it to my Project.

This module makes it as easy as typing `yarn craft-plugin-downloader install <github repo url>` in your terminal and we will download the Plugin, extract it and copy it to the craft Plugin folder.

If you don't use yarn please the explanation further down

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
    "tmpFolder": "/tmp/folder/for/the/download",
    "pluginPath": "path/to/your/craft/plugins/folder"
}
```

* `plugins`: All Plugin Urls added via this module getting added to this array
* `tmpFolder`: A Temporary Folder where all Plugin .zip files getting downloaded and extracted
* `pluginPath`: The Folder to your Craft Plugin Folder

`pluginPath` and `tmpFolder` are relative to your Project Root.


# Usage
The Script provides 3 commands.
* `install <url>` Add Url to a Craft CMS Plugin github repo
* `update` Update all Plugins added via this module
* `all` Install all Plugins in the `"plugins"` array in your package.json

You can add these commands in the `scripts` part of your package.json for easier use.

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
npm run installPlugin <url to github repo>
```

with yarn
```
yarn installPlugin <url to github repo>
```
