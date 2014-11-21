#! /usr/bin/env node

var
    chalk = require('chalk'),
    parse = require('./lib/parse'),
    mergeAndDiff = require('./lib/diffmerge');


function usage() {
    console.info('Usage: node unlike <source_dir> <dest_dir>');
}

function printDiff(merge, left, right, leftPath, rightPath) {
    var
        onlyLeft = [],
        onlyRight = [],
        equalFiles = [],
        sizesDiffer = {};

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

    if (Object.keys(sizesDiffer).length > 0) {

        console.info('  In both paths, but with different sizes:');
        Object.keys(sizesDiffer).forEach(function (filename) {
            console.info('    [%s, %s] %s', chalk.yellow(sizesDiffer[filename][0]), chalk.yellow(sizesDiffer[filename][1]), filename);
        });
    }

    function parseFileDiff(filename) {
        var
            file = merge[filename];

        if (file.diff.exists === 'left') {
            onlyLeft.push(filename);
        } else if (file.diff.exists === 'right') {
            onlyRight.push(filename);
        } else {

            if (file.diff.size !== 0) {
                sizesDiffer[filename] = [file.left.size, file.right.size];
            } else {
                equalFiles.push(filename);
            }
        }
    }

    function color(val) {
        var
            f = val === 0 ? chalk.white : val > 0 ? chalk.green : chalk.red;

        return f(val);
    }
}

function main(args) {
    var
        left, right, merge;

    if (args.length < 2) {

        usage();

    } else {

        console.error(chalk.gray('Reading "%s"...'), args[0]);
        left = parse(args[0]);

        console.error(chalk.gray('Reading "%s"...'), args[1]);
        right = parse(args[1]);

        merge = mergeAndDiff(left, right);

        printDiff(merge, left, right, args[0], args[1]);
    }
}

main(process.argv.slice(2));
