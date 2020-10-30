var fs = require('fs')
var should = require('should')
var stream = require('readable-stream')
var collect = require('get-stream')
var exs = require('..')

describe('exceljs-through-stream', function () {
  it('should export a function', function () {
    should(typeof exs).equal('function')
  })
  it('should export a function that returns a stream', function () {
    should(exs() instanceof stream)
  })
  it('parse xlsx files', async () => {
    const file = fs.createReadStream(__dirname + '/file.xlsx')
    const res = await collect.array(file.pipe(exs()))
    should(res.length).equal(4)
    should(res[0]).eql({
      row: 'row1',
      date: new Date('2017-02-08T00:00:00.000Z'),
      cost: 100,
      notes: 111
    })
  })
  it('parse larger xlsx files', async () => {
    const file = fs.createReadStream(__dirname + '/larger-file.xlsx')
    const res = await collect.array(file.pipe(exs()))
    should(res.length).eql(51000)
    should(res[0]).eql({
      Department: 'Law Enforcement',
      'Fiscal Year': '2017-18',
      'Property Value': 5000,
      'Tax Dollars': 4.74
    })
  })
  it('return error if file is invalid', (done) => {
    var file = fs.createReadStream(__dirname + '/index.js')
    file.pipe(exs({ objectMode: false }))
      .on('error', function (e) {
        should(e.message).equal('Legacy XLS files are not supported, use an XLSX file instead!')
        done()
      })
  })
})
