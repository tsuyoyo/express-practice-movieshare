/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var should = require('should');
var request = require('supertest');
var ObjectID = require('mongodb').ObjectID;

var QuestionDb = require('../../models/questionarydb').createClient();

var app = require('../../app');
var testGetMethod = require('./testutil').TestUtil(app).testGetMethod;
var testPostMethod = require('./testutil').TestUtil(app).testPostMethod;

describe('questionary.js', function() {

  var API = {

    add: function() {
      return '/question/add';
    },

    getAll: function() {
      return '/question/getall';
    },

    delete: function(id) {
      return '/question/delete/' + id + '/';
    },

    updateIndex: function(id, newIndex, currentIndex) {
      return '/question/updateIndex/' + id + '/' + newIndex + '/'  + currentIndex;
    }

    // update: function(id) {
    //   return '/questionary/update/' + id + '/';
    // },

  };

  var testData = [
    { type: 'star',
      tag: 'tag01',
      question: { jp : 'dummy question01 in Japanese',
                  en : 'dummy question01 in English' },
      options: ['opt01', 'opt02' ]
    },
    { type: 'checkbox',
      tag: 'tag02',
      question: { jp : 'dummy question02 in Japanese',
                  en : 'dummy question02 in English' }
    },

    { type: 'text',
      tag: 'tag03',
      question: { jp : 'dummy question03 in Japanese',
                  en : 'dummy question03 in English' }
    },
  ];

  var addedIds = [];

  beforeEach(function(done) {
    var i = 0;

    var doAdd = function() {
      var data = testData[i];
      QuestionDb.add(data.type, data.question, data.tag, data. options, function(addedItem) {

        addedIds.push(addedItem._id);

        i++;
        if (i == testData.length) {
          done();
        } else {
          doAdd();
        }
      });
    };

    doAdd();
  });

  afterEach(function(done) {
    var i = 0;
    addedIds.forEach(function(id) {
      QuestionDb.delete(id, function() {
        i++;
        if (i == addedIds.length - 1) {
          addedIds = [];
          QuestionDb.findAll(function(questions) {
            questions.length.should.be.eql(0);
            done();
          });
        }
      });
    });
  });

  describe('/questionary/add', function() {

    describe('Add question', function() {

      var reqBody = {
        index: testData.length,
        tag: 'testTag',
        type: 'testType',
        question: { jp : 'test quesiton in Japanese',
                    en : 'test question in English' },
        options: [ 'opt01', 'opt02', 'opt03', 'opt04', 'opt05' ]
      };

      it('should return 200 with added question', function(done) {

        testPostMethod(API.add(), reqBody, 200, function(res) {

          addedIds.push(ObjectID(res.body._id));

          QuestionDb.findAll(function(questions) {
            questions.length.should.be.eql(testData.length + 1);
            done();
          });
        });
      });

      it('should return postend entry correctly', function(done) {

        testPostMethod(API.add(), reqBody, 200, function(res) {

          addedIds.push(ObjectID(res.body._id));

          QuestionDb.find(ObjectID(res.body._id), function(item) {

            item.should.have.property('index');
            item.should.have.property('tag');
            item.should.have.property('type');
            item.should.have.property('question');
            item.question.should.have.property('jp');
            item.question.should.have.property('en');
            item.should.have.property('options');
            item.options.length.should.be.eql(5);

            done();
          });
        });
      });

      it('should assign the biggest index to new entry', function(done) {

        testPostMethod(API.add(), reqBody, 200, function(res) {

          addedId = addedIds.push(ObjectID(res.body._id));

          res.body.index.should.be.eql(testData.length);

          done();

        });

      });
    });
  });

  describe('/questionary/getall', function() {

    describe('when three questionaries are registered', function() {

      it('should return 200 with 3 questionaries', function(done) {

        testGetMethod(API.getAll(), 200, done, function(res) {

          res.body.questions.length.should.be.eql(testData.length);

          done();
        });

      });
    });
  });

  describe('/questionaries/delete', function() {

    describe('when try to delte 2nd item', function() {

      beforeEach(function(done) {

        var targetData = testData[1];

        QuestionDb.find({ tag: targetData.tag }, function(question) {

          var targetId = question._id.toString();
          testGetMethod(API.delete(targetId), 200, done, function(res) {
            done();
          });

        });

      });

      it('should decrease the index of 3rd item', function(done) {

        var targetData = testData[2];
        QuestionDb.find({ tag: targetData.tag }, function(question) {

          // Originary it should be 2,
          // after 2nd item is deleted, it should be 1.
          question.index.should.be.eql(1);

          done();
        });

      });

      it('should not update the index of 1st item', function(done) {

        var targetData = testData[0];
        QuestionDb.find({ tag: targetData.tag }, function(question) {

          // Originary it should be 0,
          // even after 2nd item is deleted, it should not be changed.
          question.index.should.be.eql(0);

          done();
        });

      });

    });

    describe('when try to delete unexisting item', function() {

      it('should return 200', function(done) {

        var dummyId = ObjectID('123456789012345678901234');
        testGetMethod(API.delete(dummyId), 200, done, function(res) {
          done();
        });

      });

    });

  });

  describe('/questionary/changeIndex', function() {

    describe('when try to changeIndex from 0 to 2', function() {

      var id;

      var currentIndex = 0;

      beforeEach(function(done) {
        QuestionDb.find({ tag: testData[0].tag }, function(question) {
          id = question._id.toString();
          done();
        });
      });

      var newIndex = 2;

      it('should return 200', function(done) {

        testGetMethod(API.updateIndex(id, newIndex, currentIndex),
          200, done, function(res) {
          done();
        });

      });

      it('should update index correctly', function(done) {

        var onUpdate = function(res) {

          QuestionDb.findAll(function(questions) {

            questions.length.should.be.eql('3');

            for (var i = 0; i < questions.length; i++) {

              if ('tag01' === questions[i].tag) {

                questions[i].index.should.be.eql(2);

              } else if ('tag02' === questions[i].tag) {

                questions[i].index.should.be.eql(0);

              } else if ('tag03' === questions[i].tag) {

                questions[i].index.should.be.eql(1);

              } else {
                // Should not come here
                true.should.be.false;
              }
            }

            done();
          });
        };

        testGetMethod(API.updateIndex(id, newIndex, currentIndex),
          200, done, onUpdate);

      });

    });

    describe('when try to changeIndex from 2 to 0', function() {

      var id;

      var currentIndex = 2;

      beforeEach(function(done) {
        QuestionDb.find({ tag: testData[2].tag }, function(question) {
          id = question._id.toString();
          done();
        });
      });

      var newIndex = 0;

      it('should return 200', function(done) {

        testGetMethod(API.updateIndex(id, newIndex, currentIndex),
          200, done, function(res) {
          done();
        });

      });

      it('should update index correctly', function(done) {

        var onUpdate = function(res) {

          QuestionDb.findAll(function(questions) {

            questions.length.should.be.eql('3');

            for (var i = 0; i < questions.length; i++) {

              if ('tag01' === questions[i].tag) {

                questions[i].index.should.be.eql(1);

              } else if ('tag02' === questions[i].tag) {

                questions[i].index.should.be.eql(2);

              } else if ('tag03' === questions[i].tag) {

                questions[i].index.should.be.eql(0);

              } else {
                // Should not come here
                true.should.be.false;
              }
            }

            done();
          });
        };

        testGetMethod(API.updateIndex(id, newIndex, currentIndex),
          200, done, onUpdate);

      });

    });

    describe('when try to update but actually the index is same', function() {

      var id;

      beforeEach(function(done) {
        QuestionDb.find({ tag: testData[0].tag }, function(question) {
          id = question._id.toString();
          done();
        });
      });

      it('should return 200', function(done) {

        // No change will happen
        testGetMethod(API.updateIndex(id, 0, 0),
          200, done, function(res) {
          done();
        });

      });
    })

    describe('when try to update non-existing item', function() {

      it('should return 400 with error message', function(done) {

        var dummyId = ObjectID('123456789012345678901234');
        testGetMethod(API.updateIndex(dummyId, 0, 0),
          400, done, function() { done() });

      });

    });

  });

});
