/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var MarkDbBase = require('./markdbbase').MarkDbBase;
var COLLECTION_NAME = 'videotag_collection';

var VideoTagDb = function() {

  var base = new MarkDbBase(COLLECTION_NAME);

  for (var key in base) {
    if (typeof(base[key]) === 'function') {
      this[key] = base[key];
    }
  }
};

exports.createClient = function () {
  return new VideoTagDb();
};
