#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git commit" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message if
# it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".

# Stash anything not being committed
git stash -q --keep-index

echo
echo "Generating dist"
echo
# Make the dist files
make dist
echo
echo
echo "Distribution generation complete"
echo
echo "Adding updated files to commit"
echo
# add them
git add dist/
git add -u dist/

# Restore uncommitted changes
git stash pop -q
