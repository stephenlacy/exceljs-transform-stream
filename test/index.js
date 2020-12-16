/* eslint-disable no-magic-numbers */
const fs = require('fs')
const should = require('should')
const { pipeline } = require('readable-stream')
const collect = require('get-stream')
const parse = require('..')

const pipe = (...s) => {
  const out = pipeline(...s, (err) => {
    if (err) out.emit('error', err)
  })
  return out
}
describe('exceljs-transform-stream', () => {
  it('should export a function', () => {
    should(typeof parse).equal('function')
  })
  it('parse xlsx files', async () => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    const res = await collect.array(pipe(file, parse()))
    should(res.length).equal(4)
    should(res[0]).eql({
      row: 'row1',
      date: new Date('2017-02-08T00:00:00.000Z'),
      cost: 100,
      notes: 111
    })
  })
  it('parse xlsx files with a specific selector', async () => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    const res = await collect.array(pipe(file, parse({ selector: 'Sheet1' })))
    should(res.length).equal(4)
    should(res[0]).eql({
      row: 'row1',
      date: new Date('2017-02-08T00:00:00.000Z'),
      cost: 100,
      notes: 111
    })
  })
  it('parse xlsx files with a specific selector, and handle no matches', async () => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    const res = await collect.array(pipe(file, parse({ selector: 'Sheet999' })))
    should(res.length).equal(0)
  })
  it('parse larger xlsx files', async () => {
    const file = fs.createReadStream(`${__dirname}/larger-file.xlsx`)
    const res = await collect.array(pipe(file, parse()))
    should(res.length).eql(51000)
    should(res[0]).eql({
      Department: 'Law Enforcement',
      'Fiscal Year': '2017-18',
      'Property Value': 5000,
      'Tax Dollars': 4.74
    })
  })

  it('parse xlsx files with dates', async () => {
    const file = fs.createReadStream(`${__dirname}/with-dates.xlsx`)
    const res = await collect.array(pipe(file, parse()))
    should(res.length).eql(2488)
    should(res[0]).eql({
      requestedVehicleType: 'AMB',
      'from Zip': 90404,
      'to Zip': 90401,
      'Pickup Date': new Date('2019-07-01T00:00:00.000Z'),
      'Pickup time': new Date('1899-12-30T12:40:00.000Z'),
      finalCost: 0.5,
      status: 'Completed',
      passengerCost: 0.5
    })
    should(res.every((d) =>
      d['Pickup Date'] instanceof Date && d['Pickup time'] instanceof Date
    )).eql(true)
  })
  it('return error if file is invalid', (done) => {
    const file = fs.createReadStream(`${__dirname}/index.js`)
    pipeline(file, parse(), (err) => {
      should(err.message).equal('Legacy XLS files are not supported, use an XLSX file instead!')
      done()
    })
  })
  it('stop pipeline on demand without blowing up', (done) => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    const s = pipe(file, parse())
    collect.array(s)
      .then(() => {
        done()
      })
      .catch((err) => {
        done(err)
      })
    process.nextTick(() => s.end())
  })
  it('stop file on demand without blowing up', (done) => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    pipeline(file, parse(), (err) => {
      should.exist(err)
      should(err.message).equal('blow up')
      done()
    })
    process.nextTick(() => file.destroy(new Error('blow up')))
  })
})

describe('exceljs-transform-stream#getSelectors', () => {
  it('should export a function', () => {
    should(typeof parse.getSelectors).equal('function')
  })
  it('parse xlsx files', async () => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    const res = await collect.array(pipe(file, parse.getSelectors()))
    should(res).eql([ '*', 'Sheet1' ])
  })
  it('parse larger xlsx files', async () => {
    const file = fs.createReadStream(`${__dirname}/larger-file.xlsx`)
    const res = await collect.array(pipe(file, parse.getSelectors()))
    should(res).eql([ '*', 'Sheet1' ])
  })
  it('return error if file is invalid', (done) => {
    const file = fs.createReadStream(`${__dirname}/index.js`)
    pipeline(file, parse.getSelectors(), (err) => {
      should(err.message).equal('Legacy XLS files are not supported, use an XLSX file instead!')
      done()
    })
  })
  it('stop pipeline on demand without blowing up', (done) => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    const s = pipe(file, parse.getSelectors())
    collect.array(s)
      .then(() => {
        done()
      })
      .catch((err) => {
        done(err)
      })
    process.nextTick(() => s.end())
  })
  it('stop file on demand without blowing up', (done) => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    pipeline(file, parse.getSelectors(), (err) => {
      should.exist(err)
      should(err.message).equal('blow up')
      done()
    })
    process.nextTick(() => file.destroy(new Error('blow up')))
  })
})
