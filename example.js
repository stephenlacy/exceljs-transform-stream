const request = require('superagent')
const through = require('through2')
const stream = require('./')

const req = request.get('http://localhost:8000/file.xlsx')
  .buffer(false)
  .pipe(stream())
  .on('data', (d) => console.log(String(d), 'line'))
  .on('end', console.log)
