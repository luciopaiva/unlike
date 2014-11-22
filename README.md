unlike
======

Command line tool to point differences between two folders.

``unlike`` will compare both folders and give a detailed description of what is different from one 
folder to the other. ``unlike`` is safe to use; it will not change the contents of any folder.

## Installation

    npm install --global unlike

It should work fine in Linux and OSX. I don't expect it to work in Windows because I haven't tested yet. Let me know if it does.

## How to use

    unlike [options] <source_dir> <dest_dir>

Available options:

* ``-s``, ``--size``: compare file sizes
* ``-a``, ``--atime``: compare file access times
* ``-m``, ``--mtime``: compare file modified times
* ``-c``, ``--ctime``: compare file change times
* ``-v``, ``--verbose``: toggle verbose mode

If no option is passed, ``unlike`` treats files as equal sufficing that their names are equal, even if their sizes differ.

Beware option ``-c`` does not compare file *creation* times, but file *change* times! See [what Google has to say about it](https://www.google.com/#q=Difference+between+mtime%2C+ctime+and+atime).

## Example

Assuming the following folder structure:

    f1/
        a   // file contains string "123\n"
        b   // file contains string "456\n"
    f2/
        a   // file contains string "123\n"
        b   // file is empty
        d

Issuing the command below will produce the following output:

![command output](https://cloud.githubusercontent.com/assets/6631859/5152924/c195b8c4-71f1-11e4-939b-cf6dad1cf3ba.png)

## To do

Add the following checks:

* files having different contents (maybe using [checksum](https://github.com/dshaw/checksum))
* files with different access modes
