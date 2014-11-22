#! /usr/bin/env node

var
    chalk = require('chalk'),
    minimist = require('minimist'),
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
        creationDatesDiffer = [],
        modifiedDatesDiffer = [],
        accessDatesDiffer = [],
        sizesDiffer = [];

    Object.keys(merge).sort().forEach(parseFileDiff);

    console.info('\nResults');

    console.info('  Files in %s: %s', leftPath, chalk.yellow(Object.keys(left).length));
    console.info('  Files in %s: %s', rightPath, chalk.yellow(Object.keys(right).length));
    console.info('  File count after merge: %s', chalk.yellow(Object.keys(merge).length))

    if (equalFiles.length > 0) {

        console.info('  Files equal in both paths:', leftPath);

        if (equalFiles.length > 10) {

            console.info('    %s files match', chalk.yellow(equalFiles.length));

        } else {

            equalFiles.forEach(function (filename) {
                console.info('    %s', filename)
            });
        }
    }

    if (onlyLeft.length > 0) {

        console.info('  Only in [%s]:', leftPath);

        if (onlyLeft.length > 10) {

            console.info('    %s files match', chalk.yellow(equalFiles.length));

        } else {

            onlyLeft.forEach(function (filename) {
                console.info('    %s', filename)
            });
        }
    }

    if (onlyRight.length > 0) {

        console.info('  Only in [%s]:', rightPath);

        if (onlyRight.length > 10) {

            console.info('    %s files match', chalk.yellow(equalFiles.length));

        } else {

            onlyRight.forEach(function (filename) {
                console.info('    %s', filename)
            });
        }
    }

    if (sizesDiffer.length > 0) {

        console.info('  File with different sizes in each folder:');
        sizesDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.size), chalk.yellow(merge[filename].right.size), filename);
        });
    }

    if (accessDatesDiffer.length > 0) {

        console.info('  File with different access times in each folder:');
        accessDatesDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.atime), chalk.yellow(merge[filename].right.atime), filename);
        });
    }

    if (creationDatesDiffer.length > 0) {

        console.info('  File with different creation times in each folder:');
        creationDatesDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.ctime), chalk.yellow(merge[filename].right.ctime), filename);
        });
    }

    if (modifiedDatesDiffer.length > 0) {

        console.info('  File with different modified times in each folder:');
        modifiedDatesDiffer.forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(merge[filename].left.mtime), chalk.yellow(merge[filename].right.mtime), filename);
        });
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

            if (options.atime && file.diff.differsInAccessDate) {
                accessDatesDiffer.push(filename);
                match = false;
            }

            if (options.ctime && file.diff.differsInCreationDate) {
                creationDatesDiffer.push(filename);
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
            'c', 'a', 'm', 's', 'ctime', 'atime', 'mtime', 'size'
        ],
        alias: {
            c: 'ctime',
            a: 'atime',
            m: 'mtime',
            s: 'size'
        }
    };

    return minimist(process.argv.slice(2), minimistOptions);
}

function main(args) {
    var
        left, right, merge;

    if (args._.length < 2) {

        usage();

    } else {

        console.error(chalk.gray('Reading "%s"...'), args._[0]);
        left = parse(args._[0]);

        console.error(chalk.gray('Reading "%s"...'), args._[1]);
        right = parse(args._[1]);

        merge = mergeAndDiff(left, right);

        printDiff(merge, left, right, args._[0], args._[1], args);
    }
}

main(processArgs());
