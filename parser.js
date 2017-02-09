const XmlStream = require('xml-stream')
const unzip = require('unzip')
const assert = require('assert')

const defaultOpts = {
  parser: {}
}

const constants = {
  header: 't',
  rowPrefix: 'c'
}

module.exports = function xlsx (opts) {
  opts = opts || defaultOpts
  let sharedStrings = []
  let rows = []
  return unzip.Parse()
    .on('entry', function (entry) {
      // let sheets
      // if (entry.path === 'xl/workbook.xml') {
      //   const xml = new XmlStream(entry)
      //   xml.collect('sheet')
      //   xml.on('endElement: sheet', function (d) {
      //     sheets = d['$']
      //   })
      //   xml.on('end', () => {
      //     console.log(sheets)
      //   })
      // }
      if (entry.path.match(/worksheets\/(.*).xml$/)) {
        const xml = new XmlStream(entry)
        xml.collect('row')
        xml.on('endElement: c', function (item) {
          rows.push(item)
        })
      }
      else if (entry.path.match(/sharedStrings/)) {
        const xml = new XmlStream(entry)
        xml.collect('sst')
        xml.on('updateElement: si', function (item) {
          sharedStrings.push(item[constants.header])
        })
      }
      else {
        entry.autodrain()
      }
    })
    .on('end', function () {
      console.log(sharedStrings)
      console.log(JSON.stringify(rows[0], null, 2))
      console.log(JSON.stringify(rows[4], null, 2))
      let results = {}
      let headers = {}
      rows.forEach(function (value, key) {
        if (!value['$']) return
        const item = {}
        // check if it is already partialy created
        // let insert = results[value['$'].r]
        // if (!insert) results[value['$'].r] = {}
        const c = value['$']
        const cv = parseInt(value.v)
        const id = c.r.substring(1, 10)
        if (id === '1') {
          headers[c.r] = { id: c.r.substring(0, 1), r: c.r, row: sharedStrings[cv] }
          return
        }
        if (!results[id]) {
          results[id] = {}
        }
        if (c && c.t) {
          if (sharedStrings[cv]) {
            item[headers[c.r.substring(0, 1) + '1'].row] = sharedStrings[cv]

          }
        }
        results[c.r] = item
      })
      console.log(results)
      const expected = [{
        row: '1',
        date: '2/8/2017',
        cost: '100',
        notes: '111'
      }]
      // assert.deepEqual(expected, result)
    })
}




let o = {
  "c": {
    "v": "3",
    "$": {
      "r": "D1",
      "s": "1",
      "t": "s"
    }
  },
  "$": {
    "r": "1"
  }
}
