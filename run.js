var common = require('./common.js')
var test = require('tape')

var levelup = require('levelup')
// TODO modularize levelup errors
var errors  = require('levelup/lib/errors.js')
common.errors = errors

var tests = require('./')(createTest, common)

function createTest(message, testFunc) {
  var testCase = {}
  common.commonSetUp.call(testCase, levelup, function(err) {
    if (err) throw err
    test(message, function(t) {
      testCase.test = t
      testFunc.call(testCase, t, done)
      
      function done() {
        common.commonTearDown.call(testCase, function(err) {
          if (err) throw err
          t.end()
        })
      }
      
    })
  })
}