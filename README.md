unlike
======

Command line tool to point differences between two folders.

``unlike`` will compare both folders and give a detailed description of what is different from one 
folder to the other. ``unlike`` is safe to use; it will not change the contents of any folder.

## Installation

    npm install --global unlike

*Note: let me know if it works in Windows!*

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

    $ unlike -svm f1/ f2/
    Reading "f1/"...
    ++
    Reading "f2/"...
    +++
    
    Results
      Files in f1/: 2
      Files in f2/: 3
      File count after merge: 3
      Only in [f2/]:
        d
      Different sizes in each folder:
        [0, 4] b
        Total: 1 file
      Different modified dates in each folder:
        [Sat Nov 22 2014 01:28:01 GMT-0200 (BRST), Sat Nov 22 2014 01:28:33 GMT-0200 (BRST)] a
        [Sat Nov 22 2014 01:28:10 GMT-0200 (BRST), Sat Nov 22 2014 01:28:41 GMT-0200 (BRST)] b
        Total: 2 files

## To do

Add the following checks:

* files having different contents (maybe using [checksum](https://github.com/dshaw/checksum))
* files with different access modes
