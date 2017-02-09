const request = require('superagent')
const through = require('through2')
const stream = require('./')

const req = request.get('http://localhost:8000/file.xlsx')
  .pipe(stream())
  .on('data', (d) => console.log(String(d)))
