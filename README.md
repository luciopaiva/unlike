unlike
======

Command line tool to point differences between two folders.

``unlike`` will compare both folders and give a detailed description of what is different from one 
folder to the other. ``unlike`` is safe to use; it will not change the contents of any folder.

What ``unlike`` understands as "different":

* files that exist only in one of the folders
* files that have different sizes

## Installation

    npm install --global unlike

## How to use

    unlike <source_dir> <dest_dir>

Example:

    $ unlike /Volumes/DISK1 /home/someuser/backups/disk1
    Results
      Files in /Volumes/DISK1: 731
      Files in /home/someuser/backups/disk1: 731
      File count after merge: 731
      Files equal in both paths:
        730 files match
      In both paths, but with different sizes:
        [38868, 31337] foo.jpg

## To do

Add the following checks:

* files whose timestamp doesn't match
* files having different contents
