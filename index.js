const Excel = require('exceljs')
const through = require('through2')
const duplex = require('duplexify')
const { pipeline, Readable } = require('readable-stream')

module.exports = function excelStream(opts={}) {
  const input = through()
  const reader = new Excel.stream.xlsx.WorkbookReader(input, {
  	entries: 'emit',
  	sharedStrings: 'cache',
  	hyperlinks: 'cache',
  	styles: 'cache',
  	worksheets: 'emit'
  })
  const createReader = async function* () {
    for await (const worksheet of reader) {
      for await (const row of worksheet) {
        yield row
      }
    }
  }
  
  let headers
  const out = pipeline(
    Readable.from(createReader()),
    through.obj(function (row, _, cb) {
      if (row.values.length === 0) return cb() // blank
      if (!headers) {
        headers = opts.mapHeaders ? row.values.map(opts.mapHeaders) : row.values
        out.emit('header', headers)
        return cb()
      }
      const item = row.values.reduce((acc, v, idx) => {
        acc[headers[idx]] = opts.mapValues ? opts.mapValues(v) : v
        return acc
      }, {})
      cb(null, item)
    }),
    (err) => {
      if (!err) return
      if (err.message && err.message.indexOf('invalid signature') !== -1) {
        err = new Error('Legacy XLS files are not supported, use an XLSX file instead!')
      }
      out.emit('error', err)
    }
  )
  return duplex.obj(input, out)
}