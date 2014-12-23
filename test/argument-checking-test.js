/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

module.exports.testGetThrowables = function(test, common) {
  test('test get() throwables', function(t, done) {
    this.openTestDatabase(function(db) {
      var expected = /ReadError: get\(\) requires key and callback arguments/
      t.throws(db.get.bind(db), expected, 'no-arg get() throws')
      t.throws(db.get.bind(db, 'foo'), expected, '1-arg get() throws')
      t.throws(db.get.bind(db, 'foo', {}), expected, '2-arg get() throws')
      done()
    })
  })
}

module.exports.testPutThrowables = function(test, common) {
  test('test put() throwables', function(t, done) {
    this.openTestDatabase(function(db) {
      var expected = /WriteError: put\(\) requires key and value arguments/
      t.throws(db.put.bind(db), expected, 'no-arg put() throws')
      t.throws(db.put.bind(db, 'foo'), expected, '1-arg put() throws')
      done()
    })
  })
}

module.exports.testDelThrowables = function(test, common) {
  test('test del() throwables', function(t, done) {
    this.openTestDatabase(function(db) {
      var expected = /WriteError: del\(\) requires a key argument/
      t.throws(db.del.bind(db), expected, 'no-arg del() throws')
      done()
    })
  })
}

module.exports.testApproximateSizeThrowables = function(test, common) {
  test('test approximateSize() throwables', function(t, done) {
    this.openTestDatabase(function(db) {
      var expected = /ReadError: approximateSize\(\) requires start, end and callback arguments/
      t.throws(db.approximateSize.bind(db), expected, 'no-arg approximateSize() throws')
      t.throws(db.approximateSize.bind(db, 'foo'), expected, 'callback-less, 1-arg approximateSize() throws')
      t.throws(db.approximateSize.bind(db, 'foo', 'bar'), expected, 'callback-less, 2-arg approximateSize() throws')
      t.throws(db.approximateSize.bind(db, 'foo', 'bar', {}), expected, 'callback-less, 3-arg approximateSize(), no cb throws')
      done()
    })
  })
}

module.exports.testBatchThrowables = function(test, common) {
  test('test batch() throwables', function(t, done) {
    this.openTestDatabase(function(db) {
      var expected = /WriteError: batch\(\) requires an array argument/
      t.throws(db.batch.bind(db, null, {}), expected, 'no-arg batch() throws')
      t.throws(db.batch.bind(db, {}), expected, '1-arg, no Array batch() throws')
      done()
    })
  })
}

module.exports.all = function(test, common) {
  module.exports.testGetThrowables(test, common)
  module.exports.testPutThrowables(test, common)
  module.exports.testDelThrowables(test, common)
  module.exports.testApproximateSizeThrowables(test, common)
  module.exports.testBatchThrowables(test, common)
}
