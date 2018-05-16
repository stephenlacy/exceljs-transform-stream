var Excel = require('exceljs')
var through = require('through2')
var duplex = require('duplexify')

var defaultOpts = {
  objectMode: true
}

module.exports = function exceljsStream(opts) {
  opts = Object.assign(defaultOpts, opts)
  var input = through()
  var second = through({ objectMode: opts.objectMode })
  var workbook = new Excel.Workbook()

  var headers = null
  var reader = workbook.xlsx.read(input)
  .then(function (worksheet) {
    workbook.eachSheet(function (sheet, id) {
      sheet.eachRow(function (row, id) {
        if (id === 1 || !headers) {
          headers = opts.mapHeaders ? row.values.map(opts.mapHeaders) : row.values
          return
        }
        var item = {}
        row.values.forEach(function (v, k) {
           if (!headers) return
          item[headers[k]] = opts.mapValues ? opts.mapValues(v) : v
        })
        if (!opts.objectMode) {
          second.push(JSON.stringify(item))
          return
        }
        second.push(item)
      })
    })
    second.emit('end')
  })
  return duplex.obj(input, second)
}
