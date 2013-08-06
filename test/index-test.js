var vows = require('vows');
var assert = require('assert');
var util = require('util');
var captureplay = require('passport-captureplay');


vows.describe('passport-captureplay').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(captureplay.version);
    },
  },
  
}).export(module);
