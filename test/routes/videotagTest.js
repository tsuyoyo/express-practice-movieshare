/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var VideoTagDb = require('../../models/videotagdb').createClient();
var MarkTestBase = require('./markTestBase').MarkTestBase;

describe('videotag.js', function() {

  // Urls for each API.
  var API = {
    add: function() {
      return '/videotag/add';
    },
    get: function(id, userId) {
      var url = '/videotag/tag/';
      if (id) {
        url += id;
      } else {
        return null;
      }
      if (userId) {
        url += '/' + userId;
      }
      return url;
    },
    getall: function() {
      return '/videotag/getall/';
    },
    getPublicAll: function() {
      return '/videotag/getpublicall/';
    },
    delete: function(id) {
      return '/videotag/delete/' + id;
    }
  };

  var responseKeys = {
    mark  : 'tag',
    marks : 'tags'
  };

  var base = new MarkTestBase(API, VideoTagDb, responseKeys);

  describe('/videotag/add /', base.addTest);

  describe('/videotag/tag and /videotag/getall /', base.getTest);

  describe('/videotag/delete', base.deleteTest);

});
