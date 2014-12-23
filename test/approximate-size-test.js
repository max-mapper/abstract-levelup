/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

// var async = require('async')

module.exports.approximateSize = function(test, common) {
  test('approximateSize() works on empty database', function(t, done) {
    this.openTestDatabase(function(db) {
      db.approximateSize('a', 'z', function(err, size) {
        t.ifErr(err, 'no err')
        t.equals(size, 0, 'size is 0')
        done()
      })
    })
  })
}

module.exports.all = function(test, common) {
  module.exports.approximateSize(test, common)
}

// buster.testCase('approximateSize()', {
//     'setUp': common.commonSetUp
//   , 'tearDown': common.commonTearDown
//
//   , 'approximateSize() works on empty database': function (done) {
//     }
//
//   , 'approximateSize() work on none-empty database': function(done) {
//       var location = common.nextLocation()
//         , db
//
//       async.series(
//           [
//               function (callback) {
//                 this.openTestDatabase(
//                     location
//                   , function (_db) {
//                     db = _db
//                     callback()
//                   }
//                 )
//               }.bind(this)
//             , function (callback) {
//                 var batch = []
//                   , i     = 0
//
//                 for (; i < 10; ++i) {
//                   batch.push({
//                     type: 'put', key: String(i), value: 'afoovalue'
//                   })
//                 }
//                 db.batch(
//                     batch
//                   , { sync: true }
//                   , callback
//                 )
//               }
//             , function (callback) {
//                 // close db to make sure stuff gets written to disc
//                 db.close(callback)
//               }
//             , function (callback) {
//                 levelup(location, function (err, _db) {
//                   refute(err)
//                   db = _db
//                   callback()
//                 })
//               }
//             , function (callback) {
//                 db.approximateSize('0', '99', function(err, size) {
//                   refute(err) // sanity
//                   refute.equals(size, 0)
//                   callback()
//                 })
//               }
//           ]
//         , done
//       )
//     }
// })
