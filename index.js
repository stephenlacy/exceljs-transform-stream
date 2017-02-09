const Excel = require('exceljs')
const through = require('through2')
const duplex = require('duplexify')

module.exports = () => {
  const input = through()
  const second = through()
  const workbook = new Excel.Workbook()

  let headers = null
  const reader = workbook.xlsx.read(input)
  .then((worksheet) => {
    workbook.eachSheet((sheet, id) => {
      sheet.eachRow((row, id) => {
        if (id === 1 || !headers) {
          headers = row.values
          return
        }
        let item = {}
        row.values.forEach((v, k) => {
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
