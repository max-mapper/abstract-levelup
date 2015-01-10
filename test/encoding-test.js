/* Copyright (c) 2012-2014 LevelUP contributors
 * See list at <https://github.com/rvagg/node-levelup#contributing>
 * MIT License <https://github.com/rvagg/node-levelup/blob/master/LICENSE.md>
 */

module.exports.putGetPreOpen = function(test, common) {
  test('test safe decode in get()', function(t, done) {
    var self = this
    var levelup = this.levelup
    this.openTestDatabase({ createIfMissing: true, errorIfExists: true, encoding: 'utf8' }, function(db) {
      db.put('foo', 'this {} is [] not : json', function (err) {
        if (err) t.ifErr(err)
        db.close(function (err) {
          if (err) t.ifErr(err)
          db = levelup(db.location, { createIfMissing: false, errorIfExists: false, valueEncoding: 'json' })
          db.get('foo', function (err, value) {
            t.ok(err, 'got error')
            t.equals('EncodingError', err.name, 'EncodingError')
            t.notOk(value, 'no value')
            db.close(done)
          })
        })
      })
    })
  })
}


module.exports.readStream = function(test, common) {
  test('test safe decode in readStream()', function(t, done) {
    var self = this
    var levelup = this.levelup
    common.readStreamSetUp.call(this, t)
    this.openTestDatabase({ createIfMissing: true, errorIfExists: true, encoding: 'utf8' }, function(db) {
      db.put('foo', 'this {} is [] not : json', function (err) {
        if (err) t.ifErr(err)
        db.close(function (err) {
          if (err) t.ifErr(err)
          db = levelup(db.location, { createIfMissing: false, errorIfExists: false, valueEncoding: 'json' })
          var rs = db.readStream()
          rs.on('data' , self.dataSpy)
          rs.on('end'  , self.endSpy)
          rs.on('error'  , self.errorSpy)
          rs.on('close', function () {
            t.equals(self.dataCount, 0, 'no data')
            t.equals(self.errorCount, 1, 'error emitted')
            t.equals('EncodingError', self.errorEvents[0].name, 'EncodingError')
            db.close(done)
          })
        }.bind(this))
      }.bind(this))
    })
  })
}

module.exports.valueEncoding = function(test, common) {
  test('test encoding = valueEncoding', function(t, done) {
    var self = this
    // write a value as JSON, read as utf8 and check
    // the fact that we can get with keyEncoding of utf8 should demonstrate that
    // the key is not encoded as JSON
    this.openTestDatabase({ encoding: 'json' }, function (db) {
      db.put('foo:foo', { bar: 'bar' }, function (err) {
        if (err) t.ifErr(err)
        db.get('foo:foo', { keyEncoding: 'utf8', valueEncoding: 'utf8' }, function (err, value) {
          if (err) t.ifErr(err)
          t.equals(value, '{"bar":"bar"}')
          db.close(done)
        })
      })
    })
  })
}

module.exports.writeStream = function(test, common) {
  test('test write-stream encoding', function(t, done) {
    var self = this
    this.openTestDatabase({ encoding: 'json' }, function (db) {
      var ws = db.createWriteStream({
        keyEncoding : 'utf8',
        valueEncoding : 'binary'
      })
      ws.on('close', function () {
        db.get('foo', {
          keyEncoding : 'utf8',
          valueEncoding : 'binary'
        }, function (err, val) {
          if (err) t.ifErr(err)
          t.equals(val.toString(), '\u0001\u0002\u0003')
          db.close(done)
        })
      })
      ws.write({ key : 'foo', value : new Buffer([1, 2, 3]) })
      ws.end()
    })
  })
}

module.exports.writeStreamChunk = function(test, common) {
  test('test write-stream chunk encoding', function(t, done) {
    var self = this
    this.openTestDatabase({ encoding: 'json' }, function (db) {
      var ws = db.createWriteStream({
        keyEncoding : 'utf8',
        valueEncoding : 'binary'
      })
      ws.on('close', function () {
        db.get(new Buffer([1, 2, 3]), {
          keyEncoding : 'binary',
          valueEncoding : 'json'
        }, function (err, val) {
          if (err) t.ifErr(err)
          t.equals(val.some, 'json')
          db.close(done)
        })
      })
      ws.write({
        key : new Buffer([1, 2, 3]),
        value : { some : 'json' },
        keyEncoding : 'binary',
        valueEncoding : 'json'
      })
      ws.end()
    })
  })
}

module.exports.batch = function(test, common) {
  test('test batch op encoding', function(t, done) {
    var self = this
    this.openTestDatabase({ encoding: 'json' }, function (db) {
      db.batch([
        {
          type : 'put',
          key : new Buffer([1, 2, 3]),
          value : new Buffer([4, 5, 6]),
          keyEncoding : 'binary',
          valueEncoding : 'binary'
        },
        {
          type : 'put',
          key : 'string',
          value : 'string'
        }
      ], { keyEncoding : 'utf8', valueEncoding : 'utf8' },
      function (err) {
        if (err) t.ifErr(err)
        db.get(new Buffer([1, 2, 3]), {
          keyEncoding : 'binary',
          valueEncoding : 'binary'
        }, function (err, val) {
          if (err) t.ifErr(err)
          t.equals(val.toString(), '\u0004\u0005\u0006')

          db.get('string', { valueEncoding : 'utf8' }, function (err, val) {
            if (err) t.ifErr(err)
            t.equals(val, 'string')
            db.close(done)
          })
        })
      })
    })
  })
}


module.exports.all = function(test, common) {
  module.exports.putGetPreOpen(test, common)
  module.exports.readStream(test, common)
  module.exports.valueEncoding(test, common)
  module.exports.writeStream(test, common)
  module.exports.writeStreamChunk(test, common)
  module.exports.batch(test, common)
}
