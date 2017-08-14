[![NPM](https://nodei.co/npm/replace-in.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/replace-in/)

[![Travis](https://img.shields.io/travis/rust-lang/rust.svg)](https://travis-ci.org/Jimmy02020/replace-in)
[![Codecov](https://img.shields.io/codecov/c/github/codecov/example-python.svg)](https://codecov.io/gh/Jimmy02020/replace-in)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Jimmy02020/replace-in/blob/master/LICENSE)

Overview
--------
``replace-in`` is file text-replacement for [node](https://nodejs.org/en/).

How it works?
--------

``replace`` Creates read [stream](https://nodejs.org/api/stream.html) to read from the target file in chunks, do the replacement in new file holding the updated chunk using write stream.
Return array of objects contains the final results in callback function.

Original file won't be modified instead ``replace`` will create new file which have new data and delete the old one.

Getting Started
---------------

clone the repo:
```sh
git clone git@github.com:jimmy02020/replace-in.git
cd replace-in
```

Using npm:
```sh
$ npm install replace-in
```

Syntax
-------

### replace(path, objects[], callback)

``path`` String.

``objects[]`` array of objects. Each object must have two properties ``regex`` for RegExp/String to matching and ``replace`` the string that will replaced.

The callback gets two arguments ``(err, report)``.

Using replace
----------

```javascript
const replace = require('replace')

// let's create some phrases to replace it in our file.
const phrase1 = {
  // regex
  regex:/old/ig,
  // replace
  replace:'new'
}

// and we have to replace more.
const phrase1 = {
  // regex
  regex:'second',
  // replace
  replace:'third'
}

replace('/path1/path2/fileName', [phrase1, phrase1], (err, report) => {
  //
  [
    {
      isChanged: true,
      regex:/old/ig,
      replace:'new'
    },
    {
      isChanged: false, // not found so it wasn't changed
      regex:'second',
      replace:'third'
    },
   ]
  //
});
```
Or you can check specific phrase result.

```javascript
replace('/path1/path2/fileName', [ph0, ph1, p2, ph3], (err, report) => {
  if(report[2].isChanged){
    console.log('p2 was found and changed');
  } else {
    console.log('not found');
  }
});
```


Tests
-----

```sh
$ npm test
```

DISCLAIMER :disappointed:
------------------------
This package was in version 0.0.1 under `fmod` - shortcut for file modifier name and has changed to `replace` in next version.
It turns out that FMOD is a registered trademark :open_mouth: and I don't want troubles :relaxed: :sweat_smile:

License
-------

This project is licensed under the [MIT License](https://github.com/Jimmy02020/replace-in/blob/master/LICENSE)
