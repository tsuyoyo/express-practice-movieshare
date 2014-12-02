/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var VideoTagDb = require('../models/videotagdb').createClient();
var Markbase = require('./markbase').Markbase;

var responseKeys = {
  mark  : 'tag',
  marks : 'tags'
};

var base = new Markbase(VideoTagDb, responseKeys);

for(var key in base) {
  if (typeof(base[key]) === 'function') {
    exports[key] = base[key];
  }
};
