/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var should = require('should');
var request = require('supertest');
var ObjectID = require('mongodb').ObjectID;
var user = require('../../routes/user');
var UserDb = require('../../models/userdb').createClient();
var app = require('../../app');

var REGISTER_KEY = require('../../constants/registerKeys').REGISTER_KEY;
var ADMIN_REGISTER_KEY = require('../../constants/registerKeys').ADMIN_REGISTER_KEY;

describe('user.js', function() {

  var dummyUserNames = ['Yamada Yamao', 'Tanaka tanakao', 'Fuguta tarchang'];
  var dummyUserId = 'DummyUser001';
  var dummyMail = 'dummy@mail.com';
  var dummyTeam = 'dummyTeam';

  // Urls for each API.
  var API = {
    register : function() {
      return '/user/register';
    },
    unregister : function() {
      return '/user/unregister';
    },
    getUserInfo : function(userId) {
      return '/user/getUserInfo/' + userId.toHexString();
    },
    getAllUsersInfo : function() {
      return '/user/getAllUsersInfo/';
    },
    authenticate : function(mail, adminRegisterKey) {
      var uri = '/user/authenticate/';
      if (mail) {
        uri += mail + '/';
      }
      if (adminRegisterKey) {
        uri += adminRegisterKey;
      }
      return uri;
    },
  };

  function deleteUser(userName, onDeleted) {
    UserDb.findByName(userName, function(user) {
      // In case the user has been registered in DB.
      if (users) {
        // Delete the user.
        UserDb.deleteById(user._id, function() {
          // Verify the user was deleted.
          UserDb.findByName(userName, function(user) {
            onDeleted();
          });
        });
      } else {
        onDeleted();
      }
    });
  }

  // Utility method to test get method.
  function testGetMethod(api, statusCode, testMethod) {
    request(app).get(api).expect(statusCode).end(
      function(err, res) {
        testMethod(err, res);
      });
  }

  // Clear dummy like data from DB every after test case execution.
  afterEach(function(done) {
    var foundDone = 0;
    var userIds = new Array(dummyUserNames.length);
    dummyUserNames.forEach(function(name) {
      UserDb.findByName(name, function(user) {
        if (user) {
          userIds.push(user._id);
        }
        foundDone++;
        if (foundDone == dummyUserNames.length) {
          UserDb.deleteByIdList(userIds, function(err) {
            done();
          });
        }
      });
    });

  });

  // POST { name : userName, registerKey : key }
  describe('/user/register/)', function() {

    function callRegister(userName, mail, team, registerKey,
      type, adminKey, statusCode, testMethod) {

      var reqBody = {
        name : userName,
        mail : mail,
        team : team,
        type : type,
        registerkey : registerKey,
        adminregisterkey : adminKey
      };

      request(app)
      .post(API.register())
      .send(reqBody)
      .expect(statusCode)
      .end(function(err, res) {
          testMethod(err, res);
      });
    }

    var verifyBadRequest = function(done) {
      return function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.should.have.properties('errMsg');

          // Verify that '' user wasn't registered.
          UserDb.findByName('', function (user) {
            if (!user) {
              done();
            } else {
              done('user instance was returned although bad request status');
            }
          });
        }
      };
    };

    describe('Test register', function() {

      var doRegister = function(type, adminRegisterKey, expectedStatus, verify) {
        callRegister(dummyUserNames[0],
                     dummyMail,
                     dummyTeam,
                     REGISTER_KEY,
                     type,
                     adminRegisterKey,
                     expectedStatus,
                     verify);
      };

      describe('Register admin user', function() {

        var doRegiserAsAdmin = function(adminRegisterKey, expectedStatus, verify) {
          doRegister('admin', adminRegisterKey, expectedStatus, verify);
        };

        describe('with correct admin register key', function() {

          it('should return 200(OK) and user ID for the new user', function(done) {

            var verify = function(err, res) {
              // Verify the response.
              res.body.should.have.properties('user');

              // Verify DB.
              var userId = ObjectID.createFromHexString(res.body.user._id);
              UserDb.findById(userId, function (user) {
                user.name.should.equal(dummyUserNames[0]);
                user.mail.should.equal(dummyMail);
                user.team.should.equal(dummyTeam);
                done();
              });
            };

            doRegiserAsAdmin(ADMIN_REGISTER_KEY, 200, verify);

          });

        });

        describe('with wrong admin register key', function() {

          it('should return 401(Unauthorized) with errMsg', function(done) {

            var verify = function(err, res) {
              res.body.should.not.have.properties('user');
              res.body.should.have.properties('errMsg');

              done();
            };

            doRegiserAsAdmin('wrongkey', 401, verify);

          });

        });

      });


      describe('Register normal user', function() {

        var doRegiserAsUser = function(expectedStatus, verify) {
          doRegister('user', null, expectedStatus, verify);
        };

        it('should return 200(OK) and user ID for the new user', function(done) {

            var verify = function(err, res) {
              // Verify the response.
              res.body.should.have.properties('user');

              // Verify DB.
              var userId = ObjectID.createFromHexString(res.body.user._id);
              UserDb.findById(userId, function (user) {
                user.name.should.equal(dummyUserNames[0]);
                user.mail.should.equal(dummyMail);
                user.team.should.equal(dummyTeam);
                done();
              });
            };

            doRegiserAsUser(200, verify);
        });

      });

    });


    describe('Common test both for user and admin', function() {

      it('should return 400(Bad Request) when userName is empty', function(done) {
        callRegister('',
                     dummyMail,
                     dummyTeam,
                     user.registerkey,
                     'user', null,
                     400, verifyBadRequest(done));
      });

      it ('should return 400(Bad Request) when mail is empty', function(done) {
        callRegister(dummyUserNames[0],
                     '',
                     dummyTeam,
                     user.registerkey,
                    'user', null,
                     400, verifyBadRequest(done));
      });

      it ('should return 400(Bad Request) when team is empty', function(done) {
        callRegister(dummyUserNames[0],
                     dummyMail,
                     '',
                     user.registerkey,
                     'user', null,
                     400, verifyBadRequest(done));
      });

      it('should return 400(Bad Request) when the userName has been registered', function(done) {

        var dummyUserName = dummyUserNames[0];

        var verify = function(err, res) {
          if (err) {
            done(err);
          } else {
            // Verify that row for dummyUser should only be one.
            UserDb.findByName(dummyUserName, function (user) {
              var res = user.should.be.ok;
              done();
            });
          }
        };

        var onRegistered = function(userId) {
          callRegister(dummyUserName,
                       dummyMail,
                       dummyTeam,
                       user.registerkey,
                       'user', null,
                       400, verify);
        };

        UserDb.register(dummyUserName,
                        dummyMail,
                        dummyTeam,
                        'user',
                        onRegistered);
      });

      it ('should return 401(Unauthorized) when registerKey is wrong', function(done) {

        var dummyUserName = dummyUserNames[0];

        var verify = function(err, res) {
          if (err) {
            done(err);
          } else {
            res.body.should.have.properties('errMsg');
            // Verify the user wasn't registered.
            UserDb.findById(dummyUserName, function (user) {
              if (!user) {
                done();
              } else {
                done('The user should not be resistered by wrong key');
              }
            });
          }
        };

        callRegister(dummyUserName,
                     dummyMail,
                     dummyTeam,
                     'wrongKey',
                     'user', null,
                     401, verify);
      });

    });

  });

  // POST { userid : userId(ObjectId) }
  describe('/user/unregister/', function() {

    // Dummy user's id assigned in beforeEach().
    var dummyUserId;
    var dummyUserName = dummyUserNames[0];

    beforeEach(function(done) {
      var onRegistered = function(user) {
        // userId should not be null.
        // TODO : res is just for JSHint
        var res = user.should.ok;

        // Verify the user is registered.
        UserDb.findById(user._id, function(user) {
          if (user) {
            dummyUserId = user._id;
            done();
          } else {
            done('User could not register');
          }
        });
      };

      UserDb.register(
        dummyUserName,
        dummyMail,
        dummyTeam,
        'user',
        onRegistered);
    });

    function callUnregister(userId, statusCode, testMethod) {
      var reqBody = {
        id : userId
      };
      request(app)
      .post(API.unregister())
      .send(reqBody)
      .expect(statusCode)
      .end(function(err, res) {
          testMethod(err, res);
      });
    }

    it ('should return 200(OK) and the user is removed from database', function(done) {

      var verify = function(err, res) {
        if (err) {
          done(err);
        } else {
          UserDb.findById(dummyUserId, function(user) {
            if (!user) {
              done();
            } else {
              done('User was not removed from database');
            }
          });
        }
      };

      callUnregister(dummyUserId, 200, verify);

    });

    it ('should return 400(Bad Request) if no ID is sent', function(done) {

      var verify = function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      };

      callUnregister('', 400, verify);

    });

    it ('should return 400(Bad Request) if wrong ID is sent', function(done) {

      var wrongId = ObjectID('wronggUserID');

      var verify = function(err, res) {
        if (err) {
          done(err);
        } else {
          UserDb.findById(wrongId, function(user) {
            if (!user) {
              done();
            } else {
              done('User was registered though invalied id was used');
            }
          });
        }
      };

      callUnregister(wrongId, 400, verify);

    });

  });

  describe('/user/getUserInfo/:userid', function() {

    // Dummy user's id assigned in beforeEach().
    var dummyUserId;
    var dummyUserName = dummyUserNames[0];

    beforeEach(function(done) {

      var onRegistered = function(user) {
        // userId should not be null.
        // TODO : res is just for JSHint
        var res = user.should.ok;

        // Verify the user is registered.
        UserDb.findById(user._id, function(user) {
          if (user) {
            dummyUserId = user._id;
            done();
          } else {
            done('User could not be registered');
          }
        });
      };

      UserDb.register(
        dummyUserName,
        dummyMail,
        dummyTeam,
        'user',
        onRegistered);

    });

    it('should return 200(OK) and {name : xxx, _id : yyy} of the user', function(done) {
      var verify = function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.should.have.properties(
            { name : dummyUserName,
              _id : dummyUserId.toHexString() });
          done();
        }
      };

      testGetMethod(
        API.getUserInfo(dummyUserId),
        200, verify);
    });

    it ('should return 400(Bad Request) and if the userId is not found', function(done) {
      var verify = function(err, res) {
        if (err) {
          done(err);
        } else {
          done();
        }
      };

      testGetMethod(
        API.getUserInfo(ObjectID('wrongwrongID')),
        400, verify);
    });

  });

  describe('/user/getUserInfo', function() {

    var userIdList = new Array(dummyUserNames.length);

    beforeEach(function(done) {

      var registered = 0;

      var register = function(name) {
        var onRegistered = function(user) {
          if (user) {
            // Verify the user is registered.
            UserDb.findById(user._id, onFound);
          } else {
            done('User registration failed');
          }
        };

        UserDb.register(
          name,
          dummyMail,
          dummyTeam,
          'user',
          onRegistered);
      };

      var onFound = function(user) {
        userIdList.push(user._id);
        registered++;
        if (registered === dummyUserNames.length) {
          done();
        }
      };

      dummyUserNames.forEach(function(name) {
        register(name);
      });

    });

    it ('should return 200(OK) and all registered user', function(done) {

      var checkUserIncluded = function(users, name) {
        var included = false;
        for (var i=0; i<users.length; i++) {
          if(users[i].name === name) {
            included = true;
            break;
          }
        }
        return included;
      };

      var verify = function(err, res) {
        if (err) {
          done(err);
        } else {
          res.body.should.have.properties('users');

          var users = res.body.users;
          users.length.should.equal(dummyUserNames.length);

          for(var i=0; i<dummyUserNames.length; i++) {
            // TODO : r is just for JSHint
            var r = checkUserIncluded(users, dummyUserNames[i]).should.ok;
          }
          done();
        }
      };

      testGetMethod(API.getAllUsersInfo(), 200, verify);

    });

  });

  describe('/user/authenticate/:mail/:adminregisterkey', function() {

    var userId;

    var dummyMail = 'user@mail.com';

    var doRegisterUser = function(type, done) {
        var onRegistered = function(user) {
          userId = user._id;
          done();
        };

        UserDb.register('user-san', dummyMail, 'team', type, onRegistered);
    };

    afterEach(function(done) {
      if (userId) {
        UserDb.deleteById(userId, function() {
          userId = null;
          done();
        });
      }
    });

    describe('Authenticate an user account', function() {

      // Make test user account on DB
      beforeEach(function(done) {
        doRegisterUser('user', done);
      });

      describe('with valid mail address', function() {

        var authenticateAndVerify = function(registerKey, done) {

            var verify = function(err, res) {
              res.body.should.have.properties('user');
              res.body.user._id.should.be.eql(userId.toHexString());

              done();
            };

            testGetMethod(API.authenticate(dummyMail, null), 200, verify);
        };

        describe('and no adminregisterkey', function() {

          it('should return 200 with user object', function(done) {
            // Because admin key is not checked in case normal user
            authenticateAndVerify(null, done);
          });

        });

        describe('and wrong adminregisterkey', function() {

          it('should return 200 with user object', function(done) {
            // Because admin key is not checked in case normal user
            authenticateAndVerify('wrongkey', done);
          });

        });

      });

      describe('with invalid mail address', function() {

        it('should return 401 with errMsg', function(done) {

          var verify = function(err, res) {
            res.body.should.have.properties('errMsg');

            done();
          };

          testGetMethod(API.authenticate('wrong@mail.com', null), 401, verify);
        });

      });

      describe('with no mail', function() {

        it('should return 404 (Not found)', function(done) {

          testGetMethod(API.authenticate(null, null), 404, function(err, res) {
            done();
          });

        });

      });
    });

    describe('Authenticate an admin account', function() {

      // Make test admin account on DB
      beforeEach(function(done) {
        doRegisterUser('admin', done);
      });

      describe('with valid mail and correct adminregisterKey', function() {

        it('should return 200 with user object', function(done) {

           var verify = function(err, res) {
            res.body.should.have.properties('user');
            res.body.user._id.should.be.eql(userId.toHexString());

            done();
          };

          testGetMethod(API.authenticate(dummyMail, ADMIN_REGISTER_KEY), 200, verify);
        });

      });

      describe('with valid mail and wrong adminregisterKey', function() {

        it('should return 401 with errMsg', function(done) {
          var verify = function(err, res) {
            res.body.should.have.properties('errMsg');
            done();
          };

          testGetMethod(API.authenticate(dummyMail, 'wrongkey'), 401, verify);
        });

      });

    });

  });

});
