/* eslint-disable no-magic-numbers */
const fs = require('fs')
const should = require('should')
const stream = require('readable-stream')
const collect = require('get-stream')
const parse = require('..')

describe('exceljs-transform-stream', () => {
  it('should export a function', () => {
    should(typeof parse).equal('function')
  })
  it('should export a function that returns a stream', () => {
    should(parse() instanceof stream)
  })
  it('parse xlsx files', async () => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    const res = await collect.array(file.pipe(parse()))
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
    const res = await collect.array(file.pipe(parse({ selector: 'Sheet1' })))
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
    const res = await collect.array(file.pipe(parse({ selector: 'Sheet999' })))
    should(res.length).equal(0)
  })
  it('parse larger xlsx files', async () => {
    const file = fs.createReadStream(`${__dirname}/larger-file.xlsx`)
    const res = await collect.array(file.pipe(parse()))
    should(res.length).eql(51000)
    should(res[0]).eql({
      Department: 'Law Enforcement',
      'Fiscal Year': '2017-18',
      'Property Value': 5000,
      'Tax Dollars': 4.74
    })
  })
  it('return error if file is invalid', (done) => {
    const file = fs.createReadStream(`${__dirname}/index.js`)
    file.pipe(parse())
      .on('error', (e) => {
        should(e.message).equal('Legacy XLS files are not supported, use an XLSX file instead!')
        done()
      })
  })
})

describe('exceljs-transform-stream#getSelectors', () => {
  it('should export a function', () => {
    should(typeof parse.getSelectors).equal('function')
  })
  it('should export a function that returns a stream', () => {
    should(parse.getSelectors() instanceof stream)
  })
  it('parse xlsx files', async () => {
    const file = fs.createReadStream(`${__dirname}/file.xlsx`)
    const res = await collect.array(file.pipe(parse.getSelectors()))
    should(res).eql([ 'Sheet1' ])
  })
  it('parse larger xlsx files', async () => {
    const file = fs.createReadStream(`${__dirname}/larger-file.xlsx`)
    const res = await collect.array(file.pipe(parse.getSelectors()))
    should(res).eql([ 'Sheet1' ])
  })
  it('return error if file is invalid', (done) => {
    const file = fs.createReadStream(`${__dirname}/index.js`)
    file.pipe(parse.getSelectors())
      .on('error', (e) => {
        should(e.message).equal('Legacy XLS files are not supported, use an XLSX file instead!')
        done()
      })
  })
})
