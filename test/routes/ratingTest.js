/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var should = require('should');
var request = require('supertest');
var ObjectID = require('mongodb').ObjectID;
var RatingDb = require('../../models/ratingdb').createClient();
var app = require('../../app');

describe('user.js', function() {

  // Urls for each API.
  var API = {
    add : function() {
      return '/rating/add';
    },
    delete : function(ratingId) {
      return '/rating/delete/' + ratingId;
    },
    find : function(ratingId) {
      return '/rating/find/' + ratingId;
    }
  };

  describe('/rating/add', function() {

    describe('Rating is submitted correctly', function() {

      it('should return 200 with added rating object');

    });

    describe('No rating object is submitted', function() {

      it('should return 400(Bad Request)');

    });

  });

  describe('/rating/delete', function() {

    describe('try to delete existing rating', function() {

      it('should return 200 with the deleted rating id');

    });

    describe('try to delete non-existing rating', function() {

      // For client, it doesn't matter
      it('should return 200 with the deleted rating id');

    });

  });

  describe('/rating/find', function() {

    describe('try to get existing rating object', function() {

      it('should return 200 with the found object');

    });

    describe('try to get non-existing rating object', function() {

      it('should return 200 with null object');

    });

  });

});
