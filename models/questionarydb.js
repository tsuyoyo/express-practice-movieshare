/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
var database = require('./database');
var LOG = require('../debug/logutil').LOG;
var COLLECTION_NAME = 'questionary_collection';

var QuestionaryDb = function() {
  this.db = database.createDbClient(COLLECTION_NAME);
};

QuestionaryDb.prototype.add = function(type, question, tag, options, onAdded) {
  var self = this;

  self.db.find(null, function(err, items) {

    var nextIndex = 0;
    if (items && 0 < items.length) {
      for (var i=0; i < items.length; i++) {
        if (items[i].index > nextIndex) {
          nextIndex = items[i].index;
        }
      }
      nextIndex += 1;
    }

    var query = {
      index: nextIndex,
      type: type,
      tag: tag,
      question: question,
      options: options
    };

    self.db.insert(query, function(err, addedQuestion) {
      if (err) {
        LOG.E('Failed to add question : ' + err.toString());
        onAdded(null);
      }
      else {
        onAdded(addedQuestion);
      }
    });

  });

};

QuestionaryDb.prototype.updateIndex = function(questionObjId, amount, onUpdate) {

  var self = this;

  self.db.find({ _id: questionObjId}, function(err, items) {

    if (err || 0 == items.length) {
      onUpdate('Not found a question indentified by ' + questionObjId.toString());
    }

    var item = items[0];

    updateIndexes(self.db, { _id: questionObjId }, amount, function() {

      var query;

      // amountがpositiveならば、
      // { index : { $and { $gt : item.index }, { $lte : item.index + amount } } }
      // に引っかかるもののindexを-1して、item.index += amount
      if (0 < amount) {
        query = { $and: [{ index: { $gt: item.index } },
                         { index: { $lte : (item.index + amount) } },
                         { _id: { $ne : questionObjId } }
                        ]};
        updateIndexes(self.db, query, -1, onUpdate);
      }
      // amountがnegativeならば
      // { index : { $and { $lt : item.index }, { $gte : item.index + amount } } }
      // に引っかかるもののindexを+1して、item.index += amount
      else if (0 > amount) {
        query = { $and: [{ index: { $lt: item.index } },
                         { index: { $gte : item.index + amount } },
                         { _id: { $ne : questionObjId } }
                        ]};
        updateIndexes(self.db, query, 1, onUpdate);
      }
      // それ以外なら何もせず返す
      else {
        onUpdate();
      }

    });

  });

};


// query : e.g.) { index : { $gt: baseIndex } }
var updateIndexes = function(db, query, amount, done) {

  var updateOperation = { $inc: { index: amount } };

  db.update(query, updateOperation, function(updateNum) {
    done();
  });

};

QuestionaryDb.prototype.delete = function(questionId, onDeleted) {

  var self = this;

  var query = {
    _id : questionId
  };

  self.db.find(query, function(err, questions) {

    // The question has been deleted, then nothing to do.
    if (!questions || questions.length == 0) {
      onDeleted();
      return;
    }

    var question = questions[0];

    var deleteIndex = question.index;

    var doDelete = function() {
      self.db.delete(query, function(err) {
        if (err) {
          LOG.W('Error happend in delete : ' + err);
        }
        onDeleted();
      });
    };

    var updateQuery = { index : { $gt: question.index }};

    updateIndexes(self.db, updateQuery, -1, doDelete);
  });

};

QuestionaryDb.prototype.find = function(query, onFound) {
  var self = this;
  self.db.find(query, function(err, questions) {
    if (err) {
      LOG.W('QuestionaryDb find error : ' + err);
    }
    if (questions && questions.length > 0) {
      onFound(questions[0]);
    } else {
      onFound(null);
    }
  });
};

QuestionaryDb.prototype.findAll = function(onFound) {
  var self = this;
  var query = null;
  self.db.find(query, function(err, questions) {
    if (err) {
      LOG.W('QuestionaryDb find error : ' + err);
    }
    onFound(questions);
  });
};

exports.createClient = function () {
  return new QuestionaryDb();
};

