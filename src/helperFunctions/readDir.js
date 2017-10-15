const fs = require('fs-extra');
const path = require('path');

/**
 * Function to get a list with all files including those in subfolders in the given dir
 * @param dir (String)
 * @returns {Array.<T>}
 */
function readDirR(dir) {
  return fs.statSync(dir).isDirectory() ? Array.prototype.concat(...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f)))) : dir;
}

module.exports = readDirR;
