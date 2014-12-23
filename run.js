var common = require('./common.js')
var test = require('tape')
var levelup = require('levelup')

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