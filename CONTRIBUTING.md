# Contributing to BookBrainz Site

If you're reading this, you're probably creating a Pull Request or planning to do so and that's great!

In order to keep that process as pleasant as possible for all parties and to maintain a nice repository, 
please follow the steps below.

## Commits

We try to keep our commit messages readable and concise, this is especially important as they can't be rewritten—unlike 
code.

Thus please follow [this guide](http://chris.beams.io/posts/git-commit/) when writing commit messages.  
While not recommended, you can always force-push to your fork to fix bad commit messages; it is however not possible to 
force-push to this repo.

## Code
### Formatting

If you ever intend to push any code to the BookBrainz Site repository, or open
a pull request, ensure you have set up the project's pre-commit git hook. You
can do this by first installing the node module jscs globally:

    npm install -g jscs

And finally creating a symbolic link from .githooks/pre-commit to .git/hooks/pre-commit:

    ln -s ../../.githooks/pre-commit .git/hooks/pre-commit
    
  On Windows run the following command from an administrative cmd as creating a shortcut will *not* work:
  
    mklink .git\hooks\pre-commit ..\..\.githooks\pre-commit

This will check that your code is formatted correctly for contribution to the
project.
