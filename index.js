const Excel = require('exceljs')
const through = require('through2')
const duplex = require('duplexify')
const Stream = require('stream')
const readable = new Stream.Readable()

module.exports = () => {
  const input = through()
  const workbook = new Excel.Workbook()
  readable._read = () => {
    let headers = null
    const reader = workbook.xlsx.read(input)
    .then((worksheet) => {
      workbook.eachSheet((sheet, id) => {
        sheet.eachRow((row, id) => {
          if (id === 1) {
            headers = row.values
            return
          }
          let item = {}
          row.values.forEach((v, k) => {
            item[headers[k]] = v
          })
          readable.push(JSON.stringify(item))
        })
      })
      readable.push(null)
    })
  }
  return duplex(input, readable)
}
