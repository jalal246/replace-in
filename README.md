# replace-in

> Replace text in a given file.

```sh
npm install replace-in
```

## How it works?

It creates a read stream to read from the target file in chunks. Replace each
request and write the results using write stream. A final report will be
returned when the replacement is done.

## API

### replace(options)

`options` object contains:

- `path: string` file path
- `request: array` array of objects. Each object must have two properties:
  - `regex` for RegExp/String to be matched.
  - `replace` string replacement.
- `encoding:? string` read stream encoding (default: `utf8`)

The results is promise contains `report: array` An array of objects. Each element contains three keys:

- `isChanged: Boolean` search result.
- `regex: string` regex sent in the request.
- `replace: string` replacement sent in the request.

### Example

```js
const replace = require("replace-in");

// let's create some phrases to replace it in our file.
const phrase1 = {
  // regex
  regex: /old/gi,
  // replace
  replace: "new",
};

// and we have to replace more.
const phrase1 = {
  // regex
  regex: "second",
  // replace
  replace: "third",
};

const report = await replace({
  path: "/path1/path2/fileName",
  request: [phrase1, phrase1],
});

// > report
// [
//   {
//     isChanged: true,
//     regex: /old/gi,
//     replace: "new",
//   },
//   {
//     isChanged: false, // not found so it wasn't changed
//     regex: "second",
//     replace: "third",
//   },
// ];
```

Or you can check specific phrase result:

```js
const report = await replace({
  path: "/path1/path2/fileName",
  request: [phrase1, phrase1],
});

if (report[2].isChanged) {
  console.log("phrase1 was found and changed");
} else {
  console.log("phrase1 was not found in the file!");
}
```

## Tests

```sh
test
```

### Related projects

- [find-in](https://github.com/jalal246/packageSorter) - A tool, written in JS
  for Searching Text in Files.
- [textics](https://github.com/jalal246/textics-stream) &
  [textics-stream](https://github.com/jalal246/textics) - counts lines, words, chars and spaces for a given string.

- [packageSorter](https://github.com/jalal246/packageSorter) - Sorting packages
  for monorepos production.

- [move-position](https://github.com/jalal246/move-position) - Moves element in
  given array form index-A to index-B.

## License

This project is licensed under the [MIT License](https://github.com/jalal246/replace-in/blob/master/LICENSE)
