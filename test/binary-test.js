/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

var async = require('async')

module.exports.sanityCheck = function(test, common) {
  test('sanity check on test data', function(t, done) {
    this.openTestDatabase(function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no err')
        t.ok(Buffer.isBuffer(data), 'is buffer')
        common.checkBinaryTestData(t, data, 'checksum matches')
        done()
      })
    })
  })
}

module.exports.putGetBinaryValue = function(test, common) {
  test('put() and get() with binary value {encoding:binary}', function(t, done) {
    this.openTestDatabase(function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.put('binarydata', data, { encoding: 'binary' }, function (err) {
          if (err) t.ifErr(err, 'no error')
          db.get('binarydata', { encoding: 'binary' }, function (err, value) {
            if (err) t.ifErr(err, 'no error')
            t.ok(value, 'got value')
            common.checkBinaryTestData(t, value)
            done()
          })
        })
      })
    })
  })
}

module.exports.putGetBinaryValueCreateDb = function(test, common) {
  test('put() and get() with binary value {encoding:binary} on createDatabase()', function(t, done) {
    this.openTestDatabase({ createIfMissing: true, errorIfExists: true, encoding: 'binary' }, function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.put('binarydata', data, function (err) {
          if (err) t.ifErr(err, 'no error')
          db.get('binarydata', function (err, value) {
            if (err) t.ifErr(err, 'no error')
            t.ok(value, 'got value')
            common.checkBinaryTestData(t, value)
            done()
          })
        })
      })
    })
  })
}

module.exports.putGetBinaryKey = function(test, common) {
  test('put() and get() with binary key {encoding:binary}', function(t, done) {
    this.openTestDatabase(function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.put(data, 'binarydata', { encoding: 'binary' }, function (err) {
          if (err) t.ifErr(err, 'no error')
          db.get(data, { encoding: 'binary' }, function (err, value) {
            if (err) t.ifErr(err, 'no error')
            t.ok(value instanceof Buffer, 'value is buffer')
            t.equals(value.toString(), 'binarydata', 'value matches')
            done()
          })
        })
      })
    })
  })
}

module.exports.putGetBinaryValueUtf8Binary = function(test, common) {
  test('put() and get() with binary value {keyEncoding:utf8,valueEncoding:binary}', function(t, done) {
    this.openTestDatabase(function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.put('binarydata', data, { keyEncoding: 'utf8', valueEncoding: 'binary' }, function (err) {
          if (err) t.ifErr(err, 'no error')
          db.get('binarydata', { keyEncoding: 'utf8', valueEncoding: 'binary' }, function (err, value) {
            if (err) t.ifErr(err, 'no error')
            t.ok(value, 'has value')
            common.checkBinaryTestData(t, value)
            done()
          })
        })
      })
    })
  })
}

module.exports.putGetBinaryValueUtf8BinaryCreateDb = function(test, common) {
  test('put() and get() with binary value {keyEncoding:utf8,valueEncoding:binary} on createDatabase()', function(t, done) {
    this.openTestDatabase({ createIfMissing: true, errorIfExists: true, keyEncoding: 'utf8', valueEncoding: 'binary' }, function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.put('binarydata', data, function (err) {
          if (err) t.ifErr(err, 'no error')
          db.get('binarydata', function (err, value) {
            if (err) t.ifErr(err, 'no error')
            t.ok(value, 'has value')
            common.checkBinaryTestData(t, value)
            done()
          })
        })
      })
    })
  })
}

module.exports.putGetBinaryKeyUtf8Binary = function(test, common) {
  test('put() and get() with binary key {keyEncoding:binary,valueEncoding:utf8}', function(t, done) {
    this.openTestDatabase(function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.put(data, 'binarydata', { keyEncoding: 'binary', valueEncoding: 'utf8' }, function (err) {
          if (err) t.ifErr(err, 'no error')
          db.get(data, { keyEncoding: 'binary', valueEncoding: 'utf8' }, function (err, value) {
            if (err) t.ifErr(err, 'no error')
            t.equals(value, 'binarydata', 'value matches')
            done()
          })
        })
      })
    })
  })
}

module.exports.putGetBinaryKeyValue = function(test, common) {
  test('put() and get() with binary key & value {encoding:binary}', function(t, done) {
    this.openTestDatabase(function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.put(data, data, { encoding: 'binary' }, function (err) {
          if (err) t.ifErr(err, 'no error')
          db.get(data, { encoding: 'binary' }, function (err, value) {
            if (err) t.ifErr(err, 'no error')
            common.checkBinaryTestData(t, value)
            done()
          })
        })
      })
    })
  })
}

module.exports.putDelGetBinaryKey = function(test, common) {
  test('put() and del() and get() with binary key {encoding:binary}', function(t, done) {
    this.openTestDatabase(function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.put(data, 'binarydata', { encoding: 'binary' }, function (err) {
          if (err) t.ifErr(err, 'no error')
          db.del(data, { encoding: 'binary' }, function (err) {
            if (err) t.ifErr(err, 'no error')
            db.get(data, { encoding: 'binary' }, function (err, value) {
              t.ok(err, 'got error')
              t.notOk(value, 'no value')
              done()
            })
          })
        })
      })
    })
  })
}

module.exports.batchMultiplePuts = function(test, common) {
  test('batch() with multiple puts', function(t, done) {
    this.openTestDatabase(function(db) {
      common.loadBinaryTestData(function (err, data) {
        if (err) t.ifErr(err, 'no error')
        db.batch(
          [
            { type: 'put', key: 'foo', value: data },
            { type: 'put', key: 'bar', value: data },
            { type: 'put', key: 'baz', value: 'abazvalue' }
          ],
          { keyEncoding: 'utf8', valueEncoding: 'binary' },
          function (err) {
            if (err) t.ifErr(err, 'no error')
            async.forEach(
              ['foo', 'bar', 'baz'],
              function (key, callback) {
                db.get(key, { encoding: 'binary' }, function (err, value) {
                  if (err) t.ifErr(err, 'no error')
                  if (key == 'baz') {
                    t.ok(value instanceof Buffer, 'value is buffer')
                    t.equals(value.toString(), 'a' + key + 'value', 'value matches')
                    callback()
                  } else {
                    common.checkBinaryTestData(t, value)
                    callback()
                  }
                })
              },
              done
            )
          }
        )
      })
    })
  })
}

module.exports.all = function(test, common) {
  module.exports.sanityCheck(test, common)
  module.exports.putGetBinaryValue(test, common)
  module.exports.putGetBinaryValueCreateDb(test, common)
  module.exports.putGetBinaryKey(test, common)
  module.exports.putGetBinaryValueUtf8Binary(test, common)
  module.exports.putGetBinaryValueUtf8BinaryCreateDb(test, common)
  module.exports.putGetBinaryKeyUtf8Binary(test, common)
  module.exports.putGetBinaryKeyValue(test, common)
  module.exports.putDelGetBinaryKey(test, common)
  module.exports.batchMultiplePuts(test, common) 
}
