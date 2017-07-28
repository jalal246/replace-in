[![NPM](https://nodei.co/npm/fmod.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fmod/)

[![Travis](https://img.shields.io/travis/rust-lang/rust.svg)](https://travis-ci.org/Jimmy02020/fmod)
[![Codecov](https://img.shields.io/codecov/c/github/codecov/example-python.svg)](https://codecov.io/gh/Jimmy02020/fmod)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/Jimmy02020/fmod/blob/master/LICENSE)

Overview
--------
``fmod`` is [node](https://nodejs.org/en/) file modifier.

How it works?
--------

``fmod`` Creates read [stream](https://nodejs.org/api/stream.html) to read from the target file in chunks, do the replacement in new file holding the updated chunk using write stream.
Return array of objects contains the final results in callback function.

Original file won't be modified instead ``fmod`` will create new file which have new data and delete the old one.

Getting Started
---------------

clone the repo:
```sh
git clone git@github.com:jimmy02020/fmod.git
cd fmod
```

Using npm:
```sh
$ npm install fmod
```

Syntax
-------

### fmod(path, objects[], callback)

``path`` String.

``objects[]`` array of objects. Each object must have two properties ``reg`` for RegExp/String to matching and ``rep`` the string that will replaced.

The callback gets two arguments ``(err, report)``.

Using fmod
----------

```javascript
const fmod = require('fmod')

// let's create some phrases to replace it in our file.
const phrase1 = {
  // regex
  reg:/old/ig,
  // replace
  rep:'new'
}

// and we have to replace more.
const phrase1 = {
  // regex
  reg:'second',
  // replace
  rep:'third'
}

fmod('/path1/path2/fileName', [phrase1, phrase1], (err, report) => {
  //
  [
    {
      isChanged: true,
      reg:/old/ig,
      rep:'new'
    },
    { isChanged: false, // not found so it wasn't changed
      reg:'second',
      rep:'third'
    },
   ]
  //
});
```
Or you can check specific phrase result.

```javascript
fmod('/path1/path2/fileName', [ph0, ph1, p2, ph3], (err, report) => {
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

License
-------

This project is licensed under the [MIT License](https://github.com/Jimmy02020/fmod/blob/master/LICENSE)
