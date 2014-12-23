/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

var async = require('async')

module.exports.approximateSizeEmpty = function(test, common) {
  test('approximateSize() works on empty database', function(t, done) {
    this.openTestDatabase(function(db) {
      db.approximateSize('a', 'z', function(err, size) {
        if (err) t.ifErr(err, 'no err')
        t.equals(size, 0, 'size is 0')
        done()
      })
    })
  })
}

module.exports.approximateSizeNonEmpty = function(test, common) {
  test('approximateSize() work on non-empty database', function(t, done) {
    var location = common.nextLocation()
    var db
    var tests = [
      function (callback) {
        this.openTestDatabase(
            location
          , function (_db) {
            db = _db
            callback()
          }
        )
      }.bind(this),
      function (callback) {
        var batch = []
        var i = 0

        for (; i < 10; ++i) {
          batch.push({
            type: 'put', key: String(i), value: 'afoovalue'
          })
        }
        db.batch(batch, { sync: true }, callback)
      },
      function (callback) {
        // close db to make sure stuff gets written to disc
        db.close(callback)
      },
      function (callback) {
        this.levelup(location, function (err, _db) {
          if (err) t.ifErr(err, 'no err')
          db = _db
          callback()
        })
      }.bind(this),
      function (callback) {
        db.approximateSize('0', '99', function(err, size) {
          if (err) t.ifErr(err, 'no err') // sanity
          t.ok(size > 0, 'size is greater than 0')
          callback()
        })
      }
    ]
    async.series(tests, function(err) {
      if (err) t.ifErr(err, 'no err')
      done()
    })
  })
}

module.exports.all = function(test, common) {
  module.exports.approximateSizeEmpty(test, common)
  module.exports.approximateSizeNonEmpty(test, common)
}
