> Deprecated: Package moved and renamed. Please use https://github.com/staeco/xlsx-parse-stream

# exceljs-transform-stream [![Build Status](https://travis-ci.org/stevelacy/exceljs-transform-stream.svg?branch=master)](https://travis-ci.org/stevelacy/exceljs-transform-stream)

> Parse excel (XLSX) files as a through stream to JSON using exceljs

## Install

```shell
$ npm install exceljs-transform-stream
```
## Usage

```js

const exceljsStream = require('exceljs-transform-stream')

const request = require('superagent')
const through = require('through2')

const req = request.get('http://localhost:8000/file.xlsx')
  .pipe(exceljsStream())
  .on('data', (d) => console.log(String(d), 'line'))
  // => {
          row: 'row1',
          date: '2017-02-08T00:00:00.000Z',
          cost: 100,
          notes: 111
        }


const file = fs.createReadStream(__dirname + '/file.xlsx')
file
  .pipe(exceljsStream())
  .on('data', (d) => console.log(String(d), 'line'))
  // => {
          row: 'row1',
          date: '2017-02-08T00:00:00.000Z',
          cost: 100,
          notes: 111
        }

```


### Options

##### objectMode

> Enable [objectMode](https://nodejs.org/api/stream.html#stream_object_mode)

default: true

## [License](LICENSE) (MIT)
