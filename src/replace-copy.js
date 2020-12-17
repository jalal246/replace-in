/* eslint-disable no-underscore-dangle */
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

function isStr(str) {
  return typeof str === "string";
}

const TEMP_NAME = "temp-replace-in";

async function replace(dir, opts) {
  if (!opts || !Array.isArray(opts.request)) {
    err(`Invalid input`);
  }

  const lengthRequest = opts.request.length;

  for (let i = 0; i < lengthRequest; i += 1) {
    // validate request
    if (!isReg(opts.request[i]) && !isStr(opts.request[i])) {
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

  Replace.prototype._transform = function (chunk) {
    if (!isFoundAll) {
      let newChunk = chunk.toString();
      for (let i = 0; i < lengthRequest; i += 1) {
        if (!isFlags[i]) {
          if (newChunk.match(lengthRequest[i].regex)) {
            newChunk = newChunk.replace(
              lengthRequest[i].regex,
              lengthRequest[i].replace
            );
            isFlags[i] = true;
          }
        }
      }
      this.push(newChunk);
      if (!isFlags.includes(false)) {
        isFoundAll = true;
      }
    } else this.push(chunk);
  };

  const newPath = path.join(__dirname, TEMP_NAME);

  const writeStream = fs.createWriteStream(newPath);

  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(opts.path, {
      encoding: opts.encoding || "utf8",
    });

    // pipe
    readStream.pipe(Replace()).pipe(writeStream);

    readStream.on("error", (error) => reject(error));
    writeStream.on("error", (error) => reject(error));

    writeStream.on("end", async () => {});

    // finish reading
    return readStream.on("end", () => {
      writeStream.end();

      return fs.unlink(opts.path, (deleteError) => {
        if (deleteError) reject(deleteError);

        return fs.rename(newPath, opts.path, async (renameError) => {
          if (renameError) reject(renameError);

          await fileHandle.close();
          const report = [];

          for (let i = 0; i < lengthRequest; i += 1) {
            report[i] = {
              isChanged: isFlags[i],
              regex: opts.request[i].regex,
              replace: opts.request[i].replace,
            };
          }
        });
      });
    });
  });
}

module.exports = replace;
