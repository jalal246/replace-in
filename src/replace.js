/* eslint-disable no-underscore-dangle */

"use_strict";

const fs = require("fs");
const path = require("path");
const stream = require("stream");
const util = require("util");

const { Transform } = stream;

const fsPromises = fs.promises;

function Replace(options) {
  if (!(this instanceof Replace)) {
    return new Replace(options);
  }
  // init Transform
  Transform.call(this, options);
}

util.inherits(Replace, Transform);

function err(errMsg) {
  throw TypeError(`\x1b[33m${errMsg}\x1b[0m`);
}

function isReg(reg) {
  return typeof reg === "object";
}

async function replace(opts) {
  if (!opts || !Array.isArray(opts.request)) {
    err(`Invalid input`);
  }

  const lengthRequest = opts.request.length;

  for (let i = 0; i < lengthRequest; i += 1) {
    // validate request
    if (!isReg(opts.request[i])) {
      err(`Invalid request`);
      break;
    }
  }

  if (!opts.path) {
    err(`Invalid path`);
  }

  /**
   * End of checking. Everything is good.
   */
  const fileHandle = await fsPromises.open(opts.path, "r");

  const isFlags = [];
  for (let i = 0; i < lengthRequest; i += 1) isFlags[i] = false;

  let isFoundAll = false;

  Replace.prototype._transform = function transform(chunk, enc, callback) {
    if (!isFoundAll) {
      let newChunk = chunk.toString();
      for (let i = 0; i < lengthRequest; i += 1) {
        if (!isFlags[i]) {
          if (newChunk.match(opts.request[i].regex)) {
            newChunk = newChunk.replace(
              opts.request[i].regex,
              opts.request[i].replace
            );
            isFlags[i] = true;
          }
        }
      }
      this.push(newChunk);
      if (!isFlags.includes(false)) {
        isFoundAll = true;
      }
    } else {
      this.push(chunk);
    }
    callback();
  };

  const newPath = path.join(
    path.dirname(opts.path),
    `temp-${path.basename(opts.path)}`
  );

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(newPath);
    writeStream.on("error", (error) => reject(error));

    const readStream = fs.createReadStream(opts.path, {
      encoding: opts.encoding || "utf8",
    });
    readStream.on("error", (error) => reject(error));

    readStream.pipe(Replace()).pipe(writeStream);

    readStream.on("end", async () => {
      try {
        writeStream.end();
        await fsPromises.unlink(opts.path);
        await fsPromises.rename(newPath, opts.path);
        await fileHandle.close();
        const report = [];

        for (let i = 0; i < lengthRequest; i += 1) {
          report[i] = {
            isChanged: isFlags[i],
            regex: opts.request[i].regex,
            replace: opts.request[i].replace,
          };
        }

        resolve(report);
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = replace;
