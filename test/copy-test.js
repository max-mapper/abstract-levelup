/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

var async  = require('async')

module.exports.copyDb = function(test, common) {
  test('copy full database', function(t, done) {
    var self = this
    var sourceData = []

    for (var i = 0; i < 100; i++) {
      sourceData.push({
        type  : 'put',
        key   : i,
        value : Math.random()
      })
    }
    
    async.parallel(
      { src: opensrc, dst: opendst },
      function (err, dbs) {
        if (err) return t.ifErr(err)
        self.levelup.copy(dbs.src, dbs.dst, function (err) {
          if (err) return t.ifErr(err)
          verify(dbs.dst)
        })
      }
    )

    function opensrc(callback) {
      self.openTestDatabase(function (db) {
        db.batch(sourceData.slice(), function (err) {
          callback(err, db)
        })
      })
    }

    function opendst(callback) {
      self.openTestDatabase(function (db) {
        callback(null, db)
      })
    }

    function verify(dstdb) {
      async.forEach(
        sourceData,
        function (data, callback) {
          dstdb.get(data.key, function (err, value) {
            if (err) return t.ifErr(err)
            t.equals(+value.toString(), data.value, 'Destination data #' + data.key + ' has correct value')
            callback()
          })
        },
        done
      )
    }
  })
}

module.exports.all = function(test, common) {
  module.exports.copyDb(test, common)
}
