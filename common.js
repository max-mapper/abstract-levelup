/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

var crypto  = require('crypto')
  , async   = require('async')
  , rimraf  = require('rimraf')
  , fs      = require('fs')
  , path    = require('path')
  , delayed = require('delayed').delayed
  , dbidx   = 0

module.exports.nextLocation = function () {
  return path.join(__dirname, '_levelup_test_db_' + dbidx++)
}

module.exports.cleanup = function (callback) {
  fs.readdir(__dirname, function (err, list) {
    if (err) return callback(err)

    list = list.filter(function (f) {
      return (/^_levelup_test_db_/).test(f)
    })

    if (!list.length)
      return callback()

    var ret = 0

    list.forEach(function (f) {
      rimraf(path.join(__dirname, f), function () {
        if (++ret == list.length)
          callback()
      })
    })
  })
}

module.exports.openTestDatabase = function () {
  var options = typeof arguments[0] == 'object' ? arguments[0] : { createIfMissing: true, errorIfExists: true }
    , callback = typeof arguments[0] == 'function' ? arguments[0] : arguments[1]
    , location = typeof arguments[0] == 'string' ? arguments[0] : module.exports.nextLocation()

  rimraf(location, function (err) {
    if (err) t.ifErr(err, 'no err')
    this.cleanupDirs.push(location)
    this.levelup(location, options, function (err, db) {
      if (err) t.ifErr(err, 'no err')
      if (!err) {
        this.closeableDatabases.push(db)
        callback(db)
      }
    }.bind(this))
  }.bind(this))
}

module.exports.commonTearDown = function (done) {
  async.forEach(
      this.closeableDatabases
    , function (db, callback) {
        db.close(callback)
      }
    , module.exports.cleanup.bind(null, done)
  )
}

module.exports.loadBinaryTestData = function (callback) {
  fs.readFile(path.join(__dirname, 'test/data/testdata.bin'), callback)
}

module.exports.binaryTestDataMD5Sum = '920725ef1a3b32af40ccd0b78f4a62fd'

module.exports.checkBinaryTestData = function (t, testData) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(testData)
  t.equals(md5sum.digest('hex'), module.exports.binaryTestDataMD5Sum)
}

module.exports.commonSetUp = function (levelup, done) {
  this.levelup = levelup
  this.cleanupDirs = []
  this.closeableDatabases = []
  this.openTestDatabase = module.exports.openTestDatabase.bind(this)
  this.timeout = 10000
  module.exports.cleanup(done)
}

module.exports.readStreamSetUp = function (t) {
  var i, k
  var self = this
  this.dataEvents = []
  this.errorEvents = []
  this.dataCount = 0
  this.endCount = 0
  this.errorCount = 0
  
  this.dataSpy = function() {
    self.dataCount++
    var args = [].slice.call(arguments)
    self.dataEvents.push({args: args})
  }
  
  this.endSpy = function() { self.endCount++ }
  this.errorSpy = function(e) {
    self.errorCount++
    self.errorEvents.push(e)
  }

  this.sourceData = []

  for (i = 0; i < 100; i++) {
    k = (i < 10 ? '0' : '') + i
    this.sourceData.push({
      type  : 'put',
      key   : k,
      value : Math.random()
    })
  }

  this.verify = delayed(function (rs, done, data) {
    if (!data) data = this.sourceData // can pass alternative data array for verification
    t.equals(self.endCount, 1, 'ReadStream emitted single "end" event')
    t.equals(self.dataCount, data.length, 'ReadStream emitted correct number of "data" events')
    data.forEach(function (d, i) {
      var call = self.dataEvents[i]
      if (call) {
        t.equals(call.args.length, 1, 'ReadStream "data" event #' + i + ' fired with 1 argument')
        t.ok(call.args[0].key, 'ReadStream "data" event #' + i + ' argument has "key" property')
        t.ok(call.args[0].value, 'ReadStream "data" event #' + i + ' argument has "value" property')
        t.equals(call.args[0].key, d.key, 'ReadStream "data" event #' + i + ' argument has correct "key"')
        t.equals(
          +call.args[0].value,
          +d.value,
          'ReadStream "data" event #' + i + ' argument has correct "value"'
        )
      }
    }.bind(this))
    done()
  }, 0.05, this)
}
