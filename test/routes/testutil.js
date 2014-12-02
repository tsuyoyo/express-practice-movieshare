/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var request = require('supertest');

exports.TestUtil = function(app) {

  return {
    // Utility method to test get method.
    testGetMethod : function(api, statusCode, done, testMethod) {
      request(app).get(api).expect(statusCode).end(
        function(err, res) {
          if (err) {
            return done(err);
          }
          testMethod(res);
        });
    },

    testPostMethod : function(api, reqBody, statusCode, testMethod) {
      request(app)
        .post(api)
        .send(reqBody)
        .expect(statusCode)
        .end(function(err, res) {
            testMethod(res);
        });
    },

  };

};
