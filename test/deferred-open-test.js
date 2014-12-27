/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

var async   = require('async')

module.exports.putGetPreOpen = function(test, common) {
  test('put() and get() on pre-opened database', function(t, done) {
    var self = this
    this.openTestDatabase(function(db) {
      var location = common.nextLocation()
      // 1) open database without callback, opens in worker thread
      var db = self.levelup(location, { createIfMissing: true, errorIfExists: true, encoding: 'utf8' })

      self.closeableDatabases.push(db)
      self.cleanupDirs.push(location)
      t.ok(typeof db === 'object', 'db is object')
      t.equals(db.location, location, 'db location is correct')

      async.parallel([
      // 2) insert 3 values with put(), these should be deferred until the database is actually open
        db.put.bind(db, 'k1', 'v1'),
        db.put.bind(db, 'k2', 'v2'),
        db.put.bind(db, 'k3', 'v3')
      ], function () {
      // 3) when the callbacks have returned, the database should be open and those values should be in
      //    verify that the values are there
        async.forEach(
          [1, 2, 3],
          function (k, cb) {
            db.get('k' + k, function (err, v) {
              if (err) t.ifErr(err)
              t.equals(v, 'v' + k, 'k/v matches')
              cb()
            })
          },
          // sanity, this shouldn't exist
          function () {
            db.get('k4', function (err) {
              t.ok(err, 'k4 does not exist')
              // DONE
              done()
            })
          }
        )
      })

      // we should still be in a state of limbo down here, not opened or closed, but 'new'
      t.notOk(db.isOpen(), 'db is not open')
      t.notOk(db.isClosed(), 'db is not closed')
    })
  })
}

module.exports.batchPreOpen = function(test, common) {
  test('batch() on pre-opened database', function(t, done) {
    var self = this
    this.openTestDatabase(function(db) {
      var location = common.nextLocation()
      // 1) open database without callback, opens in worker thread
      var db = self.levelup(location, { createIfMissing: true, errorIfExists: true, encoding: 'utf8' })

      self.closeableDatabases.push(db)
      self.cleanupDirs.push(location)
      t.ok(typeof db === 'object', 'db is object')
      t.equals(db.location, location, 'db location is correct')

      // 2) insert 3 values with batch(), these should be deferred until the database is actually open
      db.batch([
        { type: 'put', key: 'k1', value: 'v1' },
        { type: 'put', key: 'k2', value: 'v2' },
        { type: 'put', key: 'k3', value: 'v3' }
      ], function () {
        // 3) when the callbacks have returned, the database should be open and those values should be in
        //    verify that the values are there
        async.forEach(
          [1, 2, 3],
          function (k, cb) {
            db.get('k' + k, function (err, v) {
              if (err) t.ifErr(err)
              t.equals(v, 'v' + k, 'k/v matches')
              cb()
            })
          },
          // sanity, this shouldn't exist
          function () {
            db.get('k4', function (err) {
              t.ok(err, 'k4 does not exist')
              // DONE
              done()
            })
          }
        )
      })

      // we should still be in a state of limbo down here, not opened or closed, but 'new'
      t.notOk(db.isOpen(), 'db is not open')
      t.notOk(db.isClosed(), 'db is not closed')
    })
  })
}

module.exports.chainedBatchPreOpen = function(test, common) {
  test('chained batch() on pre-opened database', function(t, done) {
    var self = this
    this.openTestDatabase(function(db) {
      var location = common.nextLocation()
      // 1) open database without callback, opens in worker thread
      var db = self.levelup(location, { createIfMissing: true, errorIfExists: true, encoding: 'utf8' })

      self.closeableDatabases.push(db)
      self.cleanupDirs.push(location)
      t.ok(typeof db === 'object', 'db is object')
      t.equals(db.location, location, 'db location is correct')

      // 2) insert 3 values with batch(), these should be deferred until the database is actually open
      db.batch()
      .put('k1', 'v1')
      .put('k2', 'v2')
      .put('k3', 'v3')
      .write(function () {
        // 3) when the callbacks have returned, the database should be open and those values should be in
        //    verify that the values are there
        async.forEach(
          [1, 2, 3],
          function (k, cb) {
            db.get('k' + k, function (err, v) {
              if (err) t.ifErr(err)
              t.equals(v, 'v' + k, 'k/v matches')
              cb()
            })
          },
          // sanity, this shouldn't exist
          function () {
            db.get('k4', function (err) {
              t.ok(err, 'k4 does not exist')
              // DONE
              done()
            })
          }
        )
      })

      // we should still be in a state of limbo down here, not opened or closed, but 'new'
      t.notOk(db.isOpen(), 'db is not open')
      t.notOk(db.isClosed(), 'db is not closed')
    })
  })
}

module.exports.readStreamPreOpen = function(test, common) {
  test('simple createReadStream() on pre-opened database', function(t, done) {
    common.readStreamSetUp.call(this, t)
    var self = this
    self.openTestDatabase(function(db) {
      var location = db.location
      db.batch(self.sourceData.slice(), function (err) {
        if (err) t.ifErr(err, 'no error')
        db.close(function (err) {
          if (err) t.ifErr(err, 'no error')
          db = self.levelup(location, { createIfMissing: false, errorIfExists: false })
          var rs = db.createReadStream()
          rs.on('data' , self.dataSpy)
          rs.on('end'  , self.endSpy)
          rs.on('close', self.verify.bind(self, rs, done))
        })
      })
    })
  })
}

module.exports.maxListeners = function(test, common) {
  test('maxListeners', function(t, done) {
    this.openTestDatabase(function(db) {
      t.equal(db._maxListeners, Infinity, 'maxListeners is Infinity')
      done()
    })
  })
}

module.exports.all = function(test, common) {
  module.exports.putGetPreOpen(test, common)
  module.exports.batchPreOpen(test, common)
  module.exports.chainedBatchPreOpen(test, common)
  module.exports.readStreamPreOpen(test, common)
  module.exports.maxListeners(test, common)
}
