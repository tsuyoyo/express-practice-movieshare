/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var QuestionaryDb = require('../models/questionarydb.js').createClient();
var ObjectID = require('mongodb').ObjectID;

exports.add = function(req, res) {

  var type = req.body.type;
  var question = req.body.question;
  var tag = req.body.tag;

  if (!type || !question || !question.jp || !question.en || !tag) {
    res.send(400, { errMsg : 'Lacking parameter to post question' });
    console.log('Parameter error');
    return;
  }

  var onAdded = function(addedQuestion) {

    if (addedQuestion) {
      res.send(200, addedQuestion);
    } else {
      res.send(400, { errMsg : 'Failed to add question' });
    }
  };

  QuestionaryDb.add(type, question, tag, req.body.options, onAdded);

};

exports.delete = function(req, res) {

  var id = req.params.id;

  if (!id) {
    res.send(400, { errMsg : 'Lacking parameter to delete question' });
    return;
  }

  QuestionaryDb.delete(ObjectID(id), function() {
    res.send(200);
  });

};

exports.getAll = function(req, res) {

  QuestionaryDb.findAll(function(questions) {
    res.send(200, { questions : questions });
  });

};

exports.updateIndex = function(req, res) {

  var newIndex = req.params.newIndex;
  var currentIndex = req.params.currentIndex;
  var questionId = ObjectID(req.params.id);

  QuestionaryDb.findAll(function(questions) {

    if (newIndex > questions.length) {
      newIndex = questions.length;
    }

    var amount = newIndex - currentIndex;

    QuestionaryDb.updateIndex(questionId, amount, function(err) {
      if (err) {
        res.send({ errMsg : 'Failed to update - ' + err }, 400);
      } else {
        res.send(200);
      }
    });

  });

};
