
var
    checksum = require('checksum'),
    chalk = require('chalk'),
    async = require('async'),
    path = require('path'),
    fs = require('fs');


/**
 * Recursively traverse rootDir collecting stats about every file.
 * Returns a dictionary of filename -> stat
 *
 * @param rootDir
 * @param options
 * @param callback
 * @returns {{}}
 */
function parseDirectory(rootDir, options, callback) {
    var
        unvisitedFiles,
        verbose, wantsChecksum,
        q,
        result;

    verbose = options.verbose;
    wantsChecksum = options.wantsChecksum;

    result = {};
    unvisitedFiles = readdirFullPath(rootDir);

    verbose && console.error(chalk.gray('Reading "%s"...'), rootDir);

    q = async.queue(fileProcessor, 1);

    verbose && process.stderr.write(chalk.gray('q' + unvisitedFiles.length));
    console.info(unvisitedFiles);
    q.push(unvisitedFiles, checkForErrors);

    console.dir(q);
    console.info('Workers: %d', q.running());
    console.dir(q);

    q.drain = whenDone;

    function fileProcessor(curFile, queueCallback) {
        var
            relFile, stat, append;

        console.info('+' + curFile);

        stat = fs.statSync(curFile);

        if (stat.isFile()) {

            // removes rootDir so path becomes relative to rootDir and normalized for later comparison with file from another root dir
            relFile = path.relative(rootDir, curFile);

            result[relFile] = {
                stat: stat
            };

            if (wantsChecksum) {

                checksum.file(curFile, function (err, cs) {
                    if (!err) {
                        verbose && process.stderr.write(chalk.gray('+'));
                        result[relFile].checksum = cs;

                        queueCallback();

                    } else {

                        queueCallback(err);
                    }
                });

            } else {

                //verbose && process.stderr.write(chalk.gray('+'));
                console.info('-' + curFile);

                queueCallback();
            }

        } else if (stat.isDirectory()) {

            append = readdirFullPath(curFile);
            //verbose && process.stderr.write(chalk.gray('q' + append.length));
            q.push(append, checkForErrors);
            queueCallback();

        } else {

            queueCallback(new Error('File "' + curFile + '" has unknown type.'));
        }
    }

    function checkForErrors(err) {

        verbose && process.stderr.write(chalk.blue('o'));
        if (err) {
            verbose && process.stderr.write(chalk.red('x'));

            q.kill();
            callback(err);
        }
    }

    function whenDone() {

        console.dir(q);

        verbose && process.stderr.write(chalk.yellow('!'));
        verbose && process.stderr.write('\n');
        callback(null, result);
    }
}

function readdirFullPath(rootDir) {
    return fs.readdirSync(rootDir).map(mapToFullPath.bind(null, rootDir))
}

function mapToFullPath(filepath, filename) {

    return path.join(filepath, filename);
}

module.exports = parseDirectory;
