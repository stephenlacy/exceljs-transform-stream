var request = require('superagent')
var through = require('through2')
var stream = require('./')

var req = request.get('http://localhost:8000/file.xlsx')
  .buffer(false)
  .pipe(stream())
  .on('data', function (d) {
    console.log(String(d), 'line')
  }
  .on('end', console.log)
