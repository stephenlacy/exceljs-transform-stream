var fs = require('fs')
var should = require('should')
var stream = require('stream')
var exs = require('..')

describe('exceljs-through-stream', function () {
  it('should export a function', function (done) {
    should(typeof exs).equal('function')
    done()
  })
  it('should export a function that returns a stream', function (done) {
    should(exs() instanceof stream)
    done()
  })
  it('parse xlsx files', function (done) {
    var file = fs.createReadStream(__dirname + '/file.xlsx')
    var res = []
    file.pipe(exs())
      .on('data', function (d) {
        res.push(d)
      })
      .on('end', function () {
        should(res.length).equal(4)
        should(JSON.stringify(res[0])).equal(
        JSON.stringify({
          row: 'row1',
          date: '2017-02-08T00:00:00.000Z',
          cost: 100,
          notes: 111
        }))
        done()
      })
  })
  it('parse xlsx files with string mode', function (done) {
    var file = fs.createReadStream(__dirname + '/file.xlsx')
    var res = []
    file.pipe(exs({ objectMode: false }))
      .on('data', function (d) {
        res.push(JSON.parse(d))
      })
      .on('end', function () {
        should(res.length).equal(4)
        should(JSON.stringify(res[0])).equal(
        JSON.stringify({
          row: 'row1',
          date: '2017-02-08T00:00:00.000Z',
          cost: 100,
          notes: 111
        }))
        done()
      })
  })
  it('return error if file is invalid', function (done) {
    var file = fs.createReadStream(__dirname + '/index.js')
    file.pipe(exs({ objectMode: false }))
      .on('error', function (e) {
        should(e.message).equal("Can't find end of central directory : is this a zip file ? If it is, see http://stuk.github.io/jszip/documentation/howto/read_zip.html")
        done()
      })
  })
})
