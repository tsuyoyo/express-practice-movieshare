/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var VideoCategoryDb = require('../../models/videocategorydb').createClient();
var MarkTestBase = require('./markTestBase').MarkTestBase;

describe('videocategory.js', function() {

  // Urls for each API.
  var API = {
    add: function() {
      return '/videocategory/add';
    },
    get: function(id, userId) {
      var url = '/videocategory/get/';
      if (id) {
        url += id
      } else {
        return null;
      }
      if (userId) {
        url += '/' + userId;
      }
      return url;
    },
    getall: function() {
      return '/videocategory/getall/';
    },
    getPublicAll: function() {
      return '/videocategory/getpublicall/';
    },
    delete: function(id) {
      return '/videocategory/delete/' + id;
    }
  };

  var responseKeys = {
    mark : 'category',
    marks : 'categories'
  };

  var base = new MarkTestBase(API, VideoCategoryDb, responseKeys);

  describe('/videocategory/add/:name', base.addTest);

  describe('Test get and getall methods', base.getTest);

  describe('/videocategory/delete/:id', base.deleteTest);

});
