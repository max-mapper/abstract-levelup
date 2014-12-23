/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

var async   = require('async')

module.exports.batchMultiplePuts = function(test, common) {
  test('batch() with multiple puts', function(t, done) {
    this.openTestDatabase(function(db) {
      db.batch(
        [
          { type: 'put', key: 'foo', value: 'afoovalue' },
          { type: 'put', key: 'bar', value: 'abarvalue' },
          { type: 'put', key: 'baz', value: 'abazvalue' }
        ],
        function (err) {
          if (err) t.ifErr(err)
          async.forEach(
            ['foo', 'bar', 'baz'],
            function (key, callback) {
              db.get(key, function (err, value) {
                if (err) t.ifErr(err)
                t.equals(value, 'a' + key + 'value')
                callback()
              })
            },
            done
          )
        }
      )
    })
  })
}

module.exports.batchMultiplePutsAndDeletes = function(test, common) {
  test('batch() with multiple puts and deletes', function(t, done) {
    this.openTestDatabase(function(db) {
        async.series(
          [
            function (callback) {
              db.batch(
                [
                  { type: 'put', key: '1', value: 'one' },
                  { type: 'put', key: '2', value: 'two' },
                  { type: 'put', key: '3', value: 'three' }
                ],
                callback
              )
            },
            function (callback) {
              db.batch(
                [
                  { type: 'put', key: 'foo', value: 'afoovalue' },
                  { type: 'del', key: '1' },
                  { type: 'put', key: 'bar', value: 'abarvalue' },
                  { type: 'del', key: 'foo' },
                  { type: 'put', key: 'baz', value: 'abazvalue' }
                ],
                callback
              )
            },
            function (callback) {
              // these should exist
              async.forEach(
                ['2', '3', 'bar', 'baz'],
                function (key, callback) {
                  db.get(key, function (err, value) {
                    if (err) t.ifErr(err)
                    t.ok(value, key + ' should exist')
                    callback()
                  })
                },
                callback
              )
            },
            function (callback) {
              // these shouldn't exist
              async.forEach(
                ['1', 'foo'],
                function (key, callback) {
                  db.get(key, function (err, value) {
                    t.ok(err, 'should error')
                    t.ok(err instanceof common.errors.NotFoundError, 'is NotFoundError')
                    t.notOk(value, key + ' should be null')
                    callback()
                  })
                },
                callback
              )
            }
        ],
        done
      )
    })
  })
}

module.exports.batchChainedInterface = function(test, common) {
  test('batch() with chained interface', function(t, done) {
    this.openTestDatabase(function(db) {
      db.put('1', 'one', function (err) {
        if (err) t.ifErr(err, 'no err')

        db.batch()
          .put('one', '1')
          .del('two')
          .put('three', '3')
          .clear()
          .del('1')
          .put('2', 'two')
          .put('3', 'three')
          .del('3')
          .write(function (err) {
            if (err) t.ifErr(err)
            async.forEach(
              [ 'one', 'three', '1', '2', '3'],
              function (key, callback) {
                db.get(key, function (err, val) {
                  if ([ 'one', 'three', '1', '3' ].indexOf(key) > -1) {
                    t.ok(err, key + ' does not exist')
                  } else {
                    if (err) t.ifErr(err, 'no err')
                    t.ok(val, key + ' exists')
                  }
                  callback()
                })
              },
              done
            )
          })
      })
    })
  })
}

module.exports.batchManipulatePut = function(test, common) {
  test('batch() with can manipulate data from put()', function(t, done) {
    this.openTestDatabase(function(db) {
      async.series(
        [
          db.put.bind(db, '1', 'one'),
          db.put.bind(db, '2', 'two'),
          db.put.bind(db, '3', 'three'),
          function (callback) {
              db.batch(
                [
                  { type: 'put', key: 'foo', value: 'afoovalue' },
                  { type: 'del', key: '1' },
                  { type: 'put', key: 'bar', value: 'abarvalue' },
                  { type: 'del', key: 'foo' },
                  { type: 'put', key: 'baz', value: 'abazvalue' }
                ],
                callback
              )
            },
          function (callback) {
            // these should exist
            async.forEach(
              ['2', '3', 'bar', 'baz'],
              function (key, callback) {
                db.get(key, function (err, value) {
                  if (err) t.ifErr(err)
                  t.ok(value, key + ' has value')
                  callback()
                })
              },
              callback
            )
          },
          function (callback) {
            // these shouldn't exist
            async.forEach(
              ['1', 'foo'],
              function (key, callback) {
                db.get(key, function (err, value) {
                  t.ok(err, 'got error')
                  t.ok(err instanceof common.errors.NotFoundError, 'is NotFoundError')
                  t.notOk(value, 'has no value')
                  callback()
                })
              },
              callback
            )
          }
        ],
        done
      )
    })
  })
}

module.exports.batchGetDel = function(test, common) {
  test('batch() data can be read with get() and del()', function(t, done) {
    this.openTestDatabase(function(db) {
      async.series(
        [
          function (callback) {
            db.batch(
              [
                { type: 'put', key: '1', value: 'one' },
                { type: 'put', key: '2', value: 'two' },
                { type: 'put', key: '3', value: 'three' }
              ],
              callback
            )
          },
          db.del.bind(db, '1', 'one'),
          function (callback) {
            // these should exist
            async.forEach(
              ['2', '3'],
              function (key, callback) {
                db.get(key, function (err, value) {
                  if (err) t.ifErr(err)
                  t.ok(value, key + ' has value')
                  callback()
                })
              },
              callback
            )
          },
          function (callback) {
            // this shouldn't exist
            db.get('1', function (err, value) {
              t.ok(err, 'got error')
              t.ok(err instanceof common.errors.NotFoundError, 'is NotFoundError')
              t.notOk(value, '1 has no value')
              callback()
            })
          }
        ],
        done
      )
    })
  })
}

module.exports.batchPutMissingValue = function(test, common) {
  test('batch#put() with missing `value`', function(t, done) {
    this.openTestDatabase(function(db) {
      var batch = db.batch()
      var expected = /WriteError: value cannot be `null` or `undefined`/
      t.throws(batch.put.bind(batch, 'foo1'), expected, 'batch#put() with value undefined throws')
      t.throws(batch.put.bind(batch, 'foo1', null), expected, 'batch#put() with value null throws')
      done()
    })
  })
}

module.exports.batchPutMissingKey = function(test, common) {
  test('batch#put() with missing `key`', function(t, done) {
    this.openTestDatabase(function(db) {
      var batch = db.batch()
      var expected = /WriteError: key cannot be `null` or `undefined`/
      t.throws(batch.put.bind(batch, undefined, 'foo1'), expected, 'batch#put() with key undefined throws')
      t.throws(batch.put.bind(batch, null, 'foo1'), expected, 'batch#put() with key null throws')
      done()
    })
  })
}

module.exports.batchPutMissingKeyAndValue = function(test, common) {
  test('test batch#put() with missing `key` and `value`', function(t, done) {
    this.openTestDatabase(function(db) {
      var batch = db.batch()
      var expected = /WriteError: key cannot be `null` or `undefined`/
      t.throws(batch.put.bind(batch), expected, 'batch#put() with undefined key and value throws')
      t.throws(batch.put.bind(batch, null, null), expected, 'batch#put() with null key and value throws')
      done()
    })
  })
}

module.exports.batchDelMissingKey = function(test, common) {
  test('test batch#del() with missing `key`', function(t, done) {
    this.openTestDatabase(function(db) {
      var batch = db.batch()
      var expected = /WriteError: key cannot be `null` or `undefined`/
      t.throws(batch.del.bind(batch, undefined, 'foo1'), expected, 'batch#del() with undefined key throws')
      t.throws(batch.del.bind(batch, null, 'foo1'), expected, 'batch#del() with null key throws')
      done()
    })
  })
}

module.exports.batchWriteNoCallback = function(test, common) {
  test('test batch#write() with no callback', function(t, done) {
    this.openTestDatabase(function(db) {
      var batch = db.batch()
      batch.write() // should not cause an error with no cb
      t.ok(true, 'did not throw')
      done()
    })
  })
}

module.exports.batchAfterWrite = function(test, common) {
  test('test batch operations after write()', function(t, done) {
    this.openTestDatabase(function(db) {
      var expected = /WriteError: write\(\) already called on this batch/
      var operations = [
        function(batch) { batch.put('whoa', 'dude') },
        function(batch) { batch.del('foo') },
        function(batch) { batch.clear() },
        function(batch) { batch.write() }
      ]
      var tests = operations.map(function(op) {
        return function(callback) {
          var batch = db.batch()
          batch.put('foo', 'bar').put('boom', 'bang').del('foo').write(callback)
          t.throws(op.bind(op, batch), expected, 'batch operation throws')
        }
      })
      async.series(tests, done)
    })
  })
}

module.exports.all = function(test, common) {
  module.exports.batchMultiplePuts(test, common)
  module.exports.batchMultiplePutsAndDeletes(test, common)
  module.exports.batchChainedInterface(test, common)
  module.exports.batchManipulatePut(test, common)
  module.exports.batchGetDel(test, common)
  module.exports.batchPutMissingValue(test, common)
  module.exports.batchPutMissingKey(test, common)
  module.exports.batchPutMissingKeyAndValue(test, common)
  module.exports.batchDelMissingKey(test, common)
  module.exports.batchWriteNoCallback(test, common)
  module.exports.batchAfterWrite(test, common)
}
