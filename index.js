var Excel = require('exceljs')
var through = require('through2')
var duplex = require('duplexify')

module.exports = function exceljsStream() {
  var input = through()
  var second = through()
  var workbook = new Excel.Workbook()

  var headers = null
  var reader = workbook.xlsx.read(input)
  .then(function (worksheet) {
    workbook.eachSheet(function (sheet, id) {
      sheet.eachRow(function (row, id) {
        if (id === 1 || !headers) {
          headers = row.values
          return
        }
        var item = {}
        row.values.forEach(function (v, k) {
           if (!headers) return
          item[headers[k]] = v
        })
        second.push(JSON.stringify(item))
      })
    })
    second.emit('end')
  })
  return duplex.obj(input, second)
}
