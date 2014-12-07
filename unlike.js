#! /usr/bin/env node

var
    chalk = require('chalk'),
    minimist = require('minimist'),
    async = require('async'),
    parse = require('./lib/parse'),
    mergeAndDiff = require('./lib/diffmerge');

function usage() {
    console.info('Usage: node unlike <source_dir> <dest_dir>');
}

function printDiff(merge, left, right, leftPath, rightPath, options) {
    var
        onlyLeft = [],
        onlyRight = [],
        equalFiles = [],
        changeDatesDiffer = [],
        modifiedDatesDiffer = [],
        accessDatesDiffer = [],
        checksumsDiffer = [],
        sizesDiffer = [];

    Object.keys(merge).sort().forEach(parseFileDiff);

    console.info('\nResults');

    console.info('  Files in %s: %s', leftPath, chalk.yellow(Object.keys(left).length));
    console.info('  Files in %s: %s', rightPath, chalk.yellow(Object.keys(right).length));
    options.verbose && console.info('  File count after merge: %s', chalk.yellow(Object.keys(merge).length))

    if (equalFiles.length > 0) {

        console.info('  Equal in both paths:', leftPath);

        if (equalFiles.length > 10) {

            console.info('    Total: %s file%s', chalk.yellow(equalFiles.length), equalFiles.length > 1 ? 's' : '');

        } else {

            equalFiles.forEach(function (filename) {
                console.info('    %s', filename)
            });
        }
    }

    if (onlyLeft.length > 0) {

        console.info('  Only in [%s]:', leftPath);

        if (onlyLeft.length > 10) {

            console.info('    Total: %s file%s', chalk.yellow(onlyLeft.length), onlyLeft.length > 1 ? 's' : '');

        } else {

            onlyLeft.forEach(function (filename) {
                console.info('    %s', filename)
            });
        }
    }

    if (onlyRight.length > 0) {

        console.info('  Only in [%s]:', rightPath);

        if (onlyRight.length > 10) {

            console.info('    Total: %s file%s', chalk.yellow(onlyRight.length), onlyRight.length > 1 ? 's' : '');

        } else {

            onlyRight.forEach(function (filename) {
                console.info('    %s', filename)
            });
        }
    }

    if (sizesDiffer.length > 0) {

        console.info('  Different sizes in each folder:');
        sizesDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.stat.size), chalk.yellow(merge[filename].right.stat.size), filename);
        });
        console.info('    Total: %s file%s', chalk.yellow(sizesDiffer.length), sizesDiffer.length > 1 ? 's' : '');
    }

    if (checksumsDiffer.length > 0) {

        console.info('  Different checksums in each folder:');
        checksumsDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.checksum), chalk.yellow(merge[filename].right.checksum), filename);
        });
        console.info('    Total: %s file%s', chalk.yellow(checksumsDiffer.length), checksumsDiffer.length > 1 ? 's' : '');
    }

    if (accessDatesDiffer.length > 0) {

        console.info('  Different access dates in each folder:');
        accessDatesDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.stat.atime), chalk.yellow(merge[filename].right.stat.atime), filename);
        });
        console.info('    Total: %s file%s', chalk.yellow(accessDatesDiffer.length), accessDatesDiffer.length > 1 ? 's' : '');
    }

    if (changeDatesDiffer.length > 0) {

        console.info('  Different change dates in each folder:');
        changeDatesDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.stat.ctime), chalk.yellow(merge[filename].right.stat.ctime), filename);
        });
        console.info('    Total: %s file%s', chalk.yellow(changeDatesDiffer.length), changeDatesDiffer.length > 1 ? 's' : '');
    }

    if (modifiedDatesDiffer.length > 0) {

        console.info('  Different modified dates in each folder:');
        modifiedDatesDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.stat.mtime), chalk.yellow(merge[filename].right.stat.mtime), filename);
        });
        console.info('    Total: %s file%s', chalk.yellow(modifiedDatesDiffer.length), modifiedDatesDiffer.length > 1 ? 's' : '');
    }

    function parseFileDiff(filename) {
        var
            match = true,
            file = merge[filename];

        if (file.diff.exists === 'left') {
            onlyLeft.push(filename);
        } else if (file.diff.exists === 'right') {
            onlyRight.push(filename);
        } else {

            if (options.size && file.diff.differsInSize) {
                sizesDiffer.push(filename);
                match = false;
            }

            if (options.hash && file.diff.differsInChecksum) {
                checksumsDiffer.push(filename);
                match = false;
            }

            if (options.atime && file.diff.differsInAccessDate) {
                accessDatesDiffer.push(filename);
                match = false;
            }

            if (options.ctime && file.diff.differsInChangeDate) {
                changeDatesDiffer.push(filename);
                match = false;
            }

            if (options.mtime && file.diff.differsInModifiedDate) {
                modifiedDatesDiffer.push(filename);
                match = false;
            }

            if (match) {
                equalFiles.push(filename);
            }
        }
    }
}

function processArgs() {
    var
        minimistOptions;

    minimistOptions = {
        boolean: [
            'c', 'a', 'm', 's', 'h', 'v', 'ctime', 'atime', 'mtime', 'size', 'hash', 'verbose'
        ],
        alias: {
            c: 'ctime',
            a: 'atime',
            m: 'mtime',
            s: 'size',
            h: 'hash',
            v: 'verbose'
        }
    };

    return minimist(process.argv.slice(2), minimistOptions);
}

function main(args) {
    var
        options;

    if (args._.length < 2) {

        usage();

    } else {

        options = {
            verbose: args.verbose,
            wantsChecksum: args.hash
        };

        async.series([
            //function (cb) {
            //    parse(args._[0], options, cb);
            //},
            //function (cb) {
            //    parse(args._[1], options, cb);
            //}
            parseFolder.bind(null, args._[0]),
            parseFolder.bind(null, args._[1])
        ], function (err, results) {
            var
                left, right, merge;

            if (!err) {

                if (results.length != 2) {
                    throw new Error('Error parsing input directories');
                }

                left = results[0];
                right = results[1];

                merge = mergeAndDiff(left, right);

                printDiff(merge, left, right, args._[0], args._[1], args);

            } else {

                throw err;
            }
        });
    }

    function parseFolder(folder, cb) {
        parse(folder, options, cb);
    }
}

main(processArgs());
