# Contributing to BookBrainz Site

If you're reading this, you're probably creating a Pull Request or planning to do so and that's great!

In order to keep that process as pleasant as possible for all parties and to maintain a nice repository,
please follow the steps below.

## Bug Tracker

We use the bug tracker at https://tickets.metabrainz.org/projects/BB to track issues with
the site or supporting BookBrainz libraries. If you find a problem, or are
looking for something to fix, please head there. We do not use GitHub issues.

## Code Style

We have a standard code style, and have an npm script set up to check that code
sticks to this style using eslint. Here as some basic style tips for contributing
to BookBrainz:

 * Beautiful, simple code is good - better to do a feature well than fast (see the Python Zen - https://www.python.org/dev/peps/pep-0020/)
 * Don't prematurely optimize - sacrificing good code for speed is rarely good
 * Use tabs for indenting, and spaces for aligning (http://lea.verou.me/2012/01/why-tabs-are-clearly-superior/).
 * Variable names should be camelCase
 * Use ES6/ES7 features - they make life easier and result in cleaner code
 * Use [JSDoc](https://jsdoc.app/) for commenting code
 * Use [TypeScript](https://www.typescriptlang.org/) everywhere - static type checking is useful

## Pull requests

Please read carefully the [MetaBrainz Github guidelines](https://github.com/metabrainz/guidelines/blob/master/GitHub.md)

## Commits

We try to keep our commit messages readable and concise, this is especially important as they can't be rewritten—unlike
code. Commit messages should follow a standard format, detailed below.

Each commit should start with one of the following identifiers, which help people
to know the purpose of the commit.

 * `feat` - a new feature, or new functionality in the site
 * `fix` - a fix for an existing feature
 * `docs` - additions or changes to the documentation
 * `style` - fixing code style issues, or improving code readability
 * `refactor` - restructuring the code without changing functionality
 * `test` - adding or changing anything to do with tests
 * `chore` - updating dependencies, updating the build scripts
 * `other` - anything that doesn't fit into the above categories

Following this, you can optionally specify a component, in parentheses. Here
is a standard list of components for BookBrainz - you can use others if you wish:

 * `editor` - the entity editor
 * `profile` - the editor profile pages
 * `display` - entity display
 * `revision` - the revision page
 * `static` - the static content pages (e.g. about/contributing)
 * `search` - anything to do with search backend or frontend
 * `achievement` - the achievement system
 * `auth` - authentication, registration and login systems
 * `core` - server-side infrastructure not related to any of the above

So, combining these first two parts, you might end up with a commit message starting like this:

    feat(editor)

Next, you'll want to add a colon `:` followed by a short summary of the commit (less than 70 characters) - this should briefly describe the change. If you can't fit it into 70 characters, you've probably put too much into a single commit - try splitting the change into smaller chunks.

Finally, if you need to give more detail about the change or give any background information, leave a blank line, and then write a longer message. Wrap lines at 80 characters.

Here's an example of a complete commit message following these guidelines:

    feat(editor): introduce new input field for author birth date

    Everybody has a birth date, and this field allows editors to record the birth
    dates of authors they add to BookBrainz. Dates in ISO 8601 format
    (https://en.wikipedia.org/wiki/ISO_8601) are accepted by the field.


## For Beginners
We welcome all contributors of all ranks to contribute towards Metabrainz foundation. If you are new to contributing towards open source software and not familiar with the workflow of github please refer to [this guide](https://akrabat.com/the-beginners-guide-to-contributing-to-a-github-project/). For any clarification, visit our [Readme](README.md) .

#### Forking
  Before beginning to contribute to the repository, it is mandatory to fork the repository to your github account and work on that fork.
  To fork the repository, press the fork  button on the top left corner of the repository.

#### Cloning
  To setup a local clone of the repository, press the clone option in the repository page and copy the link to the forked repository. 
  Then open up a terminal or command prompt and type:
  `git clone <link>`

#### Branch
  Create and checkout to a branch using this command: 
  `git checkout -b BranchName`

#### Commiting 
 After adding files or making changes to an existing file,commit the changes by following the above Commiting guidelines using this command:
  `git commit -m "Message to be typed according to the above schema"`

#### Pushing branch to Fork
  Pushing can be done by using :
  ` git push origin BranchName`

#### Pull Request
  After pushing your changes to the remote, you can create a pull request by going to the [repository](https://github.com/metabrainz/bookbrainz-site) page on github.


