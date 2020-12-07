/* eslint-disable no-loops/no-loops */
const Excel = require('exceljs')
const through = require('through2')
const duplex = require('duplexify')
const { pipeline, Readable } = require('readable-stream')

const matchSelector = (selector, worksheet) =>
  selector.includes('*') || selector.includes(worksheet.name)

const handleError = (err) => {
  if (!err) return
  if (err.message === 'FILE_ENDED') return
  if (err.message && err.message.indexOf('invalid signature') !== -1) {
    err = new Error('Legacy XLS files are not supported, use an XLSX file instead!')
  }
  throw err
}

module.exports = ({ mapHeaders, mapValues, selector = '*' } = {}) => {
  if (selector && !Array.isArray(selector)) selector = [ selector ]
  const input = through()
  const reader = new Excel.stream.xlsx.WorkbookReader(input, {
    entries: 'emit',
    sharedStrings: 'cache',
    hyperlinks: 'cache',
    styles: 'cache',
    worksheets: 'emit'
  })
  const createReader = async function* () {
    try {
      for await (const worksheet of reader) {
        if (!matchSelector(selector, worksheet)) continue
        for await (const row of worksheet) {
          yield row
        }
      }
    } catch (err) {
      handleError(err)
    }
  }

  let headers
  const out = pipeline(
    Readable.from(createReader()),
    through.obj((row, _, cb) => {
      if (row.values.length === 0) return cb() // blank
      if (!headers) {
        headers = mapHeaders ? row.values.map(mapHeaders) : row.values
        out.emit('header', headers)
        return cb()
      }
      const item = row.values.reduce((acc, v, idx) => {
        acc[headers[idx]] = mapValues ? mapValues(v) : v
        return acc
      }, {})
      cb(null, item)
    }),
    (err) => {
      if (err) out.emit('error', err)
    }
  )
  return duplex.obj(input, out)
}

module.exports.getSelectors = () => {
  const input = through()
  const reader = new Excel.stream.xlsx.WorkbookReader(input, {
    entries: 'emit',
    sharedStrings: 'cache',
    hyperlinks: 'cache',
    styles: 'cache',
    worksheets: 'emit'
  })
  const createReader = async function* () {
    try {
      for await (const worksheet of reader) {
        yield worksheet.name
      }
    } catch (err) {
      handleError(err)
    }
  }
  // just wrapping to map errors
  const mid = through.obj()
  const out = pipeline(
    Readable.from(createReader()),
    mid,
    (err) => {
      if (err) out.emit('error', err)
    }
  )
  process.nextTick(() => mid.push('*'))
  return duplex.obj(input, out)
}
