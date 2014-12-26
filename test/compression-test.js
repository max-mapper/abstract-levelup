/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

var async      = require('async')
var du         = require('du')

var compressableData = new Buffer(Array.apply(null, Array(1024 * 100)).map(function () { return 'aaaaaaaaaa' }).join(''))
var multiples = 10
var dataSize = compressableData.length * multiples

module.exports.putCompression = function(test, common) {
  test('test data is compressed by default (db.put())', function(t, done) {
    var levelup = this.levelup
    this.openTestDatabase(function(db) {
      async.forEach(
        Array.apply(null, Array(multiples)).map(function (e, i) {
          return [ i, compressableData ]
        }),
        function (args, callback) {
          db.put.apply(db, args.concat([callback]))
        },
        function() {
          cycle(t, levelup, db, true, function() {
            setTimeout(function() {
              verify(t, db.location, true, function() {
                done()
              })
            }, 0.01)
          })
        }
      )
    })
  })
}

module.exports.putCompressionFalse = function(test, common) {
  test('test data is not compressed with compression=false on open() (db.put())', function(t, done) {
    var levelup = this.levelup
    this.openTestDatabase({ createIfMissing: true, errorIfExists: true, compression: false }, function(db) {
      async.forEach(
        Array.apply(null, Array(multiples)).map(function (e, i) {
          return [ i, compressableData ]
        }),
        function (args, callback) {
          db.put.apply(db, args.concat([callback]))
        },
        function() {
          cycle(t, levelup, db, false, function() {
            setTimeout(function() {
              verify(t, db.location, false, function() {
                done()
              })
            }, 0.01)
          })
        }
      )
    })
  })
}

module.exports.batchCompression = function(test, common) {
  test('test data is compressed by default (db.batch())', function(t, done) {
    var levelup = this.levelup
    this.openTestDatabase(function(db) {
      db.batch(
        Array.apply(null, Array(multiples)).map(function (e, i) {
          return { type: 'put', key: i, value: compressableData }
        }),
        function() {
          cycle(t, levelup, db, true, function() {
            setTimeout(function() {
              verify(t, db.location, true, function() {
                done()
              })
            }, 0.01)
          })
        }
      )
    })
  })
}

module.exports.all = function(test, common) {
  module.exports.putCompression(test, common)
  module.exports.putCompressionFalse(test, common)
  module.exports.batchCompression(test, common)
}

function verify(t, location, compression, done) {
  du(location, function (err, size) {
    if (err) return t.ifErr(err)
    //console.log(Math.round((size / dataSize) * 100) + '% compression ratio (', size, 'b vs', dataSize, 'b)')
    if (compression)
      t.ok(size < dataSize, 'on-disk size (' + size + ') is less than data size (' + dataSize + ')')
    else
      t.ok(size >= dataSize, 'on-disk size (' + size + ') is greater than data size (' + dataSize + ')')
    done()
  })
}

// close, open, close again.. 'compaction' is also performed on open()s
function cycle(t, levelup, db, compression, callback) {
  var location = db.location
  db.close(function (err) {
    if (err) return t.ifErr(err)
    levelup(location, { errorIfExists: false, compression: compression }, function (err, db) {
      if (err) return t.ifErr(err)
      db.close(function (err) {
        if (err) return t.ifErr(err)
        callback()
      })
    })
  })
}