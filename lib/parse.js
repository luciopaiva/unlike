
var
    chalk = require('chalk'),
    path = require('path'),
    fs = require('fs');


/**
 * Recursively traverse rootDir collecting stats about every file.
 * Returns a dictionary of filename -> stat
 *
 * @param rootDir
 * @param verbose
 * @returns {{}}
 */
function parseDirectory(rootDir, verbose) {
    var
        unvisitedFiles,
        curFile, stat,
        files;

    files = {};
    unvisitedFiles = readdirFullPath(rootDir);

    verbose && console.error(chalk.gray('Reading "%s"...'), rootDir);

    while (unvisitedFiles.length > 0) {

        verbose && process.stderr.write(chalk.gray('+'));

        curFile = unvisitedFiles.shift();

        stat = fs.statSync(curFile);

        if (stat.isFile()) {

            // removes rootDir so path becomes relative to rootDir and normalized for later comparison with file from another root dir
            curFile = path.relative(rootDir, curFile);
            files[curFile] = stat;

        } else if (stat.isDirectory()) {

            unvisitedFiles = readdirFullPath(curFile)
                .concat(unvisitedFiles);

        } else {

            throw new Error('File "' + curFile + '" has unknown type.');
        }
    }

    verbose && process.stderr.write('\n');

    return files;
}

function readdirFullPath(rootDir) {
    return fs.readdirSync(rootDir).map(mapToFullPath.bind(null, rootDir))
}

function mapToFullPath(filepath, filename) {

    return path.join(filepath, filename);
}

module.exports = parseDirectory;
