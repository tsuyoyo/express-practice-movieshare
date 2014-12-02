/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var VideoCategoryDb = require('../models/videocategorydb').createClient();
var Markbase = require('./markbase').Markbase;

var responseKeys = {
  mark : 'category',
  marks : 'categories'
};

var base = new Markbase(VideoCategoryDb, responseKeys);

for(var key in base) {
  if (typeof(base[key]) === 'function') {
    exports[key] = base[key];
  }
};
