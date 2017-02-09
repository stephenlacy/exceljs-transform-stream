const fs = require('fs')
const should = require('should')
const stream = require('stream')
const exs = require('..')

describe('exceljs-through-stream', () => {
  it('should export a function', (done) => {
    should(typeof exs).equal('function')
    done()
  })
  it('should export a function that returns a stream', (done) => {
    should(exs() instanceof stream)
    done()
  })
  it('parse xlsx files', (done) => {
    const file = fs.createReadStream(__dirname + '/file.xlsx')
    const res = []
    file.pipe(exs())
      .on('data', (d) => {
        res.push(JSON.parse(String(d)))
      })
      .on('end', () => {
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
})
