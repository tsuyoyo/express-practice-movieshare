/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .directive('commentlist', function (Webapi, $location) {
    return {

      templateUrl: 'views/directives/commentlist.html',

      restrict: 'E',

      link: function postLink(scope, element, attrs) {

        scope.inputComment = null;

        scope.requireSubmitForm = ('submitform' in attrs);

        scope.requireVideoLink = ('videolink' in attrs);

        var videoid = attrs.videoid || null;

        scope.submitComment = function() {
          if (scope.inputComment && 0 < scope.inputComment.length) {
            var onSubmitted = function() {
              loadComments();
              scope.inputComment = '';
            };
            Webapi.submitComment(
              videoid, scope.cachedUser._id, scope.inputComment,
              onSubmitted);
          }
        };

        scope.onUserClicked = function(userId) {
          $location.path('/userview/' + userId);
        };

        scope.onClickVideoLink = function(videoId) {
          $location.path('/player/' + videoId);
        };

        var loadComments = function() {

          Webapi.comments(videoid, function(comments) {

            scope.comments = comments;

            scope.comments.forEach(function(c, index) {
              // load commenter info
              Webapi.user(c.userid, function(user) {
                comments[index].user = user.name;
                comments[index].userId = user._id;
              });

              // make commented date readable
              var postedDate = new Date(c.postedDate);
              comments[index].postedDateStr = postedDate.toLocaleString();
            });
          });
        };

        loadComments();
      }
    };
  });
