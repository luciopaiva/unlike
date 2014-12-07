

function diff(merge) {

    Object.keys(merge).forEach(function (filename) {
        var
            file = merge[filename],
            exists,
            differsInChangeDate = false,
            differsInModifiedDate = false,
            differsInAccessDate = false,
            differsInChecksum = false,
            differsInSize = false;

        if (file.left && file.right) {
            exists = 'both';
            differsInSize = file.right.stat.size !== file.left.stat.size;
            differsInChangeDate = file.right.stat.ctime.getTime() !== file.left.stat.ctime.getTime();
            differsInModifiedDate = file.right.stat.mtime.getTime() !== file.left.stat.mtime.getTime();
            differsInAccessDate = file.right.stat.atime.getTime() !== file.left.stat.atime.getTime();
            differsInChecksum = file.right.checksum !== file.left.checksum;
        } else if (file.left) {
            exists = 'left';
        } else {
            exists = 'right';
        }

        file.diff = {
            exists: exists,
            differsInSize: differsInSize,
            differsInChecksum: differsInChecksum,
            differsInChangeDate: differsInChangeDate,
            differsInModifiedDate: differsInModifiedDate,
            differsInAccessDate: differsInAccessDate
        }
    });

    return merge;
}

function merge(left, right) {
    var
        merge = {};

    Object.keys(left).forEach(function (filename) {

        merge[filename] = {
            left: left[filename]
        };

        //console.error('LEFT merge[%s] ainda não existe: %s', filename, merge[filename]);
    });

    Object.keys(right).forEach(function (filename) {

        if (!merge[filename]) {
            //console.error('RIGHT merge[%s] ainda não existe: %s', filename, merge[filename]);
            merge[filename] = {};
        }

        merge[filename].right = right[filename];
    });

    return merge;
}

function mergeAndDiff(left, right) {
    return diff(merge(left, right));
}

module.exports = mergeAndDiff;
