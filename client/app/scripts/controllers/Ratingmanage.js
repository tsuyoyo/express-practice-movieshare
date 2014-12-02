/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .controller('RatingmanageCtrl', function ($scope, Webapi) {

    $scope.types = ['fiveStar', 'radioBtn', 'select', 'text'];

    $scope.addOptionEditorNum = function() {
      var i = $scope.optionEditorNum.length;
      $scope.optionEditorNum[i] = i;
      $scope.addQuestionOptions[i] = { jp : '', en : '', tag : '' };
    };

    $scope.removeOptionEditor = function(index) {
      $scope.optionEditorNum.some(function(v, i){
        if (i === index) {
          $scope.optionEditorNum.splice(i, 1);
          $scope.addQuestionOptions.splice(i, 1);
        }
      });
    };

    $scope.submit = function() {

      var tag = $scope.addQuestionTag;
      var type = $scope.addQuestionType;
      var question = $scope.addQuestion;
      var options = $scope.addQuestionOptions;

      Webapi.addQuestion(tag, type, question, options, function() {
        initialize();
        updateQuestion();
      });

    };

    function initialize() {

      $scope.isAdding = false;

      $scope.addQuestionTag = '';

      $scope.addQuestionType = $scope.types[0];

      $scope.addQuestion = { jp : '', en : '' };

      $scope.addQuestionOptions = [];

      $scope.optionEditorNum = [];

      $scope.addOptionEditorNum();
    }

    initialize();

    $scope.registeredQuestions = [];

    var tmpIndex;
    var target;

    $scope.sortableOptions = {

      update: function(e, ui) {
        tmpIndex = ui.item.index();

        target = $scope.registeredQuestions[tmpIndex];
      },

      stop: function(e, ui) {
        var newIndex = ui.item.index();

        $scope.registeredQuestions = [];

        Webapi.updateQuestionIndex(target._id.toString(),
          tmpIndex, newIndex, function() {

          tmpIndex = undefined;
          newIndex = undefined;
          target = undefined;

          updateQuestion();

        });
      },

    };

    $scope.removeQuestion = function(id) {
      Webapi.deleteQuestion(id, function() {
        updateQuestion();
        // $scope.optionEditorNum.some(function(v, i){
        //   if (i === index) {
        //     $scope.registeredQuestions.splice(i, 1);
        //   }
        // });
      });
    };

    var updateQuestion = function() {
      Webapi.allQuestion(function(questions) {
        questions.sort(function(l, r) {
          if (l.index > r.index) {
            return 1;
          }
          if (l.index < r.index) {
            return -1;
          }
          return 0;
        });
        $scope.registeredQuestions = questions;
      });
    };

    updateQuestion();

  });
