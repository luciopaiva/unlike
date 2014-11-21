

function diff(merge) {

    Object.keys(merge).forEach(function (filename) {
        var
            file = merge[filename],
            exists,
            size = NaN;

        if (file.left && file.right) {
            exists = 'both';
            size = file.right.size - file.left.size;
        } else if (file.left) {
            exists = 'left';
        } else {
            exists = 'right';
        }

        file.diff = {
            exists: exists,
            size: size
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
