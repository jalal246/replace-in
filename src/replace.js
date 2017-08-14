/* eslint no-underscore-dangle: ["error", { "allow": ["_transform"] }] */
/* eslint func-names: ["error", "never"] */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import stream from 'stream';
import util from 'util';
import { get } from 'pathre';

const Transform = stream.Transform;


// const dirMsg = 'Invalid path. Cannot find file to read from.';
const cbMsg = 'Invalid callback function.';
const arrOfobjInvalidMsg = 'Invalid array of objects';
const arrOfobjEmptyMsg = 'Empty array of objects';
const regMsg = 'Invalid regex at: ';
const strMsg = 'Invalid string to be replaced at: ';


// function to generates error as you see.
const errUnit = errMsg => new Error(`\x1b[33m${errMsg}\x1b[0m`);

// check if input is string
const isStr = str => typeof str === 'string';

// check if input is regex
const isReg = regex => typeof regex === 'object';

// gets the phrase length
const phLen = phrase => phrase.length;

// create random file name for temp writting.
const genRandomFn = (dir) => {
  const ext = get.fileExt(dir);
  if (ext === 'env') return `.env.${crypto.randomBytes(2).toString('hex')}`;
  return `${crypto.randomBytes(2).toString('hex')}.${ext}`;
};

/**
 *
 * @param {Object}
 * @property {string} - directory
 * @property {number} - arrayOfobj
 * @callback {err~boolean}
 * if found and replaced then true, otherwise false.
 */
const replace = (dir, arrayOfobj, cb) => {
  // validate callback, else every error will be handled in callback error
  if (typeof cb !== 'function') throw errUnit(cbMsg);
  // validate file.
  return fs.open(dir, 'r', (openErr, fd) => {
    if (openErr) return cb(openErr);
    // validate arrayOfobj
    if (typeof arrayOfobj !== 'object') return cb(errUnit(arrOfobjInvalidMsg));
    // validate arrayOfobj length
    const arrayLen = phLen(arrayOfobj);
    if (arrayLen === 0) return cb(errUnit(arrOfobjEmptyMsg));
    // validate the objects inside.
    for (let i = 0; i < arrayLen; i += 1) {
      // validate regMsg in find
      if (!isReg(arrayOfobj[i].regex) && !isStr(arrayOfobj[i].regex)) {
        return cb(errUnit(regMsg + arrayOfobj[i].regex));
      }
      // validate regMsg in replace
      if (!isStr(arrayOfobj[i].replace)) return cb(errUnit(strMsg + arrayOfobj[i].replace));
    }
    // Everything good sir! ****************************************************
    // create array of flags
    const isFlags = [];
    // init arry with default false.
    for (let i = 0; i < arrayLen; i += 1) isFlags[i] = false;
    // flags
    let isFoundAll = false;
    function Replace(options) {
      // allow use without new
      if (!(this instanceof Replace)) {
        return new Replace(options);
      }
      // init Transform
      Transform.call(this, options);
    }
    util.inherits(Replace, Transform);
    Replace.prototype._transform = function (chunk, enc, callback) {
      if (!isFoundAll) {
        let newChunk = chunk.toString();
        for (let i = 0; i < arrayLen; i += 1) {
          if (!isFlags[i]) {
            if (newChunk.match(arrayOfobj[i].regex)) {
              newChunk = newChunk.replace(arrayOfobj[i].regex, arrayOfobj[i].replace);
              isFlags[i] = true;
            }
          }
        }
        this.push(newChunk);
        if (!isFlags.includes(false)) isFoundAll = true;
      } else this.push(chunk);
      callback();
    };
    const rStream = fs.createReadStream(dir, {
      encoding: 'utf8',
    });
    // handling streams error.
    rStream.on('error', err => cb(err));
    // create temporary file path for writing tem file when reading.
    const nwPath = path.join(get.directory(dir), genRandomFn(dir));
    const wStream = fs.createWriteStream(nwPath);
    wStream.on('error', err => cb(err));
    // pipe
    rStream
      .pipe(Replace())
      .pipe(wStream);
    // finish reading
    return rStream.on('end', () => {
      // stop writting.
      wStream.end();
      return fs.unlink(nwPath, (unErr) => {
        if (unErr) return cb(unErr);
        return fs.rename(nwPath, dir, (rnErr2) => {
          if (unErr) return cb(rnErr2);
          return fs.close(fd, () => {
            const report = [];
            for (let i = 0; i < arrayLen; i += 1) {
              report[i] = {
                isChanged: isFlags[i],
                regex: arrayOfobj[i].regex,
                replace: arrayOfobj[i].replace,
              };
            }
            return cb(null, report);
          });
        });
      });
    });
  });
};


export default replace;
