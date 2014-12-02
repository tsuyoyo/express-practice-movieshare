/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var should = require('should');
var ObjectID = require('mongodb').ObjectID;
var UserDb = require('../../models/userdb').createClient();

var app = require('../../app');
var testGetMethod = require('./testutil').TestUtil(app).testGetMethod;
var testPostMethod = require('./testutil').TestUtil(app).testPostMethod;

// keyNames = { mark : xxx, marks : yyy };
exports.MarkTestBase = function(API, DbClient, keyNames) {

  /**
   * Test cases for add API.
   *
   */
  this.addTest = function() {

    describe('Normal usage/', function() {

      var addTest = function(markName, isPublic, done) {

        var verify = function(res) {
          res.body.should.have.properties(keyNames.mark);

          // Verify the new mark.
          var id = ObjectID(res.body[keyNames.mark]._id);
          DbClient.get(id, function(mark) {

            mark.name.should.equal(markName);
            mark.should.have.property('createdDate');
            mark.public.should.be.eql(isPublic);

            DbClient.delete(id, function() {
              done();
            });
          });
        };

        var reqBody = {
          name     : markName,
          ispublic : isPublic
        };

        testPostMethod(API.add(), reqBody, 200, verify);
      };

      describe('public mark/', function() {

        it('should return 200(OK) and new mark', function(done) {

          addTest('dummyMark', true, done);

        });

      });

      describe('non-public mark/', function() {

        it('should return 200(OK) and new mark', function(done) {

          addTest('dummyMark', false, done);

        });

      });

    });

    describe('Wrong usage/', function() {

      it('should return 400(Bad request) if :name is empty', function(done) {

        testPostMethod(API.add(), {}, 400, function(res) {
          res.body.should.have.properties('errMsg');
          done();
        });

      });

    });

  }; // this.addTest = function()

  /**
   * Test cases for get and getall APIs.
   *
   */
  this.getTest = function() {

    var dummyMarks = [
      { name : 'dummyMarks01', isPublic : true },
      { name : 'dummyMarks02', isPublic : false },
      { name : 'dummyMarks03', isPublic : true },
      { name : 'dummyMarks04', isPublic : false },
      { name : 'dummyMarks05', isPublic : true }
    ];

    var dummyMarkIds;

    beforeEach(function(done) {
      // Initialize
      dummyMarkIds = [];

      var addedNum = 0;

      var onAdded = function(addedMark) {
        dummyMarkIds.push(addedMark._id);

        addedNum++;
        if (addedNum == dummyMarks.length) {
          done();
        }
      };

      dummyMarks.forEach(function(mark, index) {
        DbClient.add(mark.name, mark.isPublic, onAdded);
      });
    });

    var clearDb = function(callback) {
      var deleteNum = 0;

      var onDeleted = function() {
        deleteNum++;
        if (deleteNum == dummyMarkIds.length) {
          callback();
        }
      };

      dummyMarkIds.forEach(function(id, index) {
        DbClient.delete(id, onDeleted);
      });
    }

    afterEach(function(done) {
      clearDb(function() {
        done();
      });
    });

    var getOneMarkId = function(isPublic) {
      for (var i=0; i<dummyMarks.length; i++) {
        if (isPublic == dummyMarks[i].isPublic) {
          return dummyMarkIds[i];
        }
      }
    };

    describe('accessing by admin user/', function() {

      var adminUserId;

      beforeEach(function(done) {
        var onRegistered = function(user) {
          adminUserId = user._id;
          done();
        };
        UserDb.register('name', 'mail@mail.com', 'team',
          'admin', onRegistered);
      });

      afterEach(function(done) {
        UserDb.deleteById(adminUserId, function() {
          adminUserId = null;
          done();
        });
      });

      describe('try to get public mark/', function() {

        var publicMarkId;

        beforeEach(function() {
          publicMarkId = getOneMarkId(true);
        });

        afterEach(function() {
          publicMarkId = null;
        });

        it('should return 200 and mark object', function(done) {

          var verify = function(res) {
            res.body.should.have.properties(keyNames.mark);
            res.body[keyNames.mark].public.should.be.ok;

            done();
          };

          testGetMethod(API.get(publicMarkId, adminUserId), 200, done, verify);
        });

      });

      describe('try to get non-public mark/', function() {

        var nonpublicMarkId;

        beforeEach(function() {
          nonpublicMarkId = getOneMarkId(false);
        });

        afterEach(function() {
          nonpublicMarkId = null;
        });

        it('should return 200 and mark object', function(done) {
          var verify = function(res) {
            res.body.should.have.properties(keyNames.mark);
            res.body[keyNames.mark].public.should.be.not.ok;

            done();
          };

          testGetMethod(API.get(nonpublicMarkId, adminUserId), 200, done, verify);
        });

      });

      describe('try to get all marks/', function() {

        it('should return 200 and marks list', function(done) {

          var verify = function(res) {
            res.body.should.have.properties(keyNames.marks);
            res.body[keyNames.marks].length.should.be.eql(dummyMarks.length);

            done();
          };

          testGetMethod(API.getall(), 200, done, verify);
        });

      });

    }); // describe('accessing by admin user/'...

    describe('accessing by normal user', function() {

      var normalUserId;

      beforeEach(function(done) {
        var onRegistered = function(user) {
          normalUserId = user._id;
          done();
        };
        UserDb.register('name', 'mail@mail.com', 'team',
          'user', onRegistered);
      });

      afterEach(function(done) {
        UserDb.deleteById(normalUserId, function() {
          normalUserId = null;
          done();
        });
      });

      describe('try to get public mark/', function() {

        var publicMarkId;

        beforeEach(function() {
          publicMarkId = getOneMarkId(true);
        });

        afterEach(function() {
          publicMarkId = null;
        });

        it('should return 200 and mark object', function(done) {

          var verify = function(res) {
            res.body.should.have.properties(keyNames.mark);
            res.body[keyNames.mark].public.should.be.ok;

            done();
          };

          testGetMethod(API.get(publicMarkId, normalUserId), 200, done, verify);
        });

      });

      describe('try to get non-public mark/', function() {

        var nonpublicMarkId;

        beforeEach(function() {
          nonpublicMarkId = getOneMarkId(false);
        });

        afterEach(function() {
          nonpublicMarkId = null;
        });

        it('should return 403 and errMsg', function(done) {

          var verify = function(res) {
            res.body.should.have.properties('errMsg');
            done();
          };

          testGetMethod(API.get(nonpublicMarkId, normalUserId), 403, done, verify);
        });

      });

      describe('try to get all marks/', function() {

        describe('with user ID/', function() {

          it('should return 200 and public marks list', function(done) {

            var verify = function(res) {
              res.body.should.have.properties(keyNames.marks);

              // Only public marks should be returned
              var publicMarksNum = 0;
              dummyMarks.forEach(function(mark) {
                if (mark.isPublic) {
                  publicMarksNum++;
                };
              });

              res.body[keyNames.marks].length.should.be.eql(publicMarksNum);

              done();
            };

            testGetMethod(API.getPublicAll(), 200, done, verify);
          });

        });

      });

    }); // describe('accessing by normal user'

    describe('common stuffs for any type of users', function() {

      var normalUserId;

      beforeEach(function(done) {
        var onRegistered = function(user) {
          normalUserId = user._id;
          done();
        };
        UserDb.register('name', 'mail@mail.com', 'team',
          'user', onRegistered);
      });

      afterEach(function(done) {
        UserDb.deleteById(normalUserId, function() {
          normalUserId = null;
          done();
        });
      });

      describe('when no mark is registered', function() {

        beforeEach(function(done) {
          clearDb(function() {
            done();
          });
        });

        describe('getall API', function() {

          it('should return empty list of marks', function(done) {

            var verify = function(res) {
              res.body.should.have.properties(keyNames.marks);
              res.body[keyNames.marks].length.should.be.eql(0);
              done();
            };

            testGetMethod(API.getall(), 200, done, verify);
          });

        });

        describe('get API', function() {

          it('should return 400(Bad request) with errMsg', function(done) {

            var verify = function(res) {
              res.body.should.have.properties('errMsg');
              done();
            };

            var dummyMarkId = "123456789012345678901234";

            testGetMethod(API.get(dummyMarkId, normalUserId), 400, done, verify);
          });

        });

      });

      describe('public mark is registered/', function() {

        var publicMarkId;

        beforeEach(function() {
          publicMarkId = getOneMarkId(true);
        });

        afterEach(function() {
          publicMarkId = null;
        });

        describe('try get without user ID/', function() {

          it('should return 200 and the public mark', function(done) {
            var verify = function(res) {
              res.body.should.have.properties(keyNames.mark);
              res.body[keyNames.mark].public.should.be.ok;

              done();
            };

            testGetMethod(API.get(publicMarkId, null), 200, done, verify);
          });

        });

        describe('try to get all without user ID/', function() {

          it('should return 200 and public marks list', function(done) {

            var verify = function(res) {
              res.body.should.have.properties(keyNames.marks);

              // Only public marks should be returned
              var publicMarksNum = 0;
              dummyMarks.forEach(function(mark) {
                if (mark.isPublic) {
                  publicMarksNum++;
                };
              });

              res.body[keyNames.marks].length.should.be.eql(publicMarksNum);

              done();
            };

            testGetMethod(API.getPublicAll(), 200, done, verify);
          });

        });

      });

    }); // describe('common stuffs for any type of users'

  }; // this.getTest = function(...


  /**
   * Test cases for delete API.
   *
   */
  this.deleteTest = function() {

    it('should return 200(OK) and the mark should be deleted from DB', function(done) {
      var markId;

      DbClient.add('DummyMark', true, function(mark) {
        markId = mark._id;
        testGetMethod(API.delete(markId), 200, done, verify);
      });

      var verify = function(res) {
        DbClient.get(markId, function(id) {
          // TODO : res is just for JSHint
          var res = (!id).should.be.ok; // Should be null.
          done();
        });
      };
    });

    it('should return 400(Bad request) when the mark is not found', function(done) {
      var verify = function(res) {
        done();
      };

      testGetMethod(API.delete(ObjectID('dummydummyid')), 400, done, verify);
    });

  };

}


