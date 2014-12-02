/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .directive('videoitem', function (Webapi, $location) {
    return {

      templateUrl: 'views/directives/videoitem.html',

      restrict: 'E',

      scope: true,

      link: function postLink(scope, element, attrs) {

        var video = JSON.parse(attrs.video);

        scope.onVideoClicked = function() {
          $location.path('/player/' + video._id);
        };

        scope.onUserClicked = function() {
          $location.path('/userview/' + video.userid);
        };

        scope.onCategoryClicked = function() {
          $location.path('/categoryview/' + video.categoryid);
        };

        scope.isShowUserName = function() {
          return (!scope.listType ||
            'category' === scope.listType || 'tag' === scope.listType);
        };

        scope.isShowCategory = function() {
          return (!scope.listType || 'user' === scope.listType);
        };

        scope.listType = attrs.listtype;

        scope.thumbnail = video.thumbnail;

        Webapi.user(video.userid, function(user) {
          scope.username = user.name;
        });

        Webapi.comments(video._id, function(comments) {
          scope.commentNum = comments.length;
        });

        Webapi.likesNum(video._id, function(num) {
          scope.likeNum = num;
        });

        Webapi.category(video.categoryid, function(category) {
          scope.category = category.name;
        });

        Webapi.video(video._id, function(video) {
          scope.title = video.title;
          scope.postedDate = (new Date(video.postedDate)).toLocaleString();
        });

      }
    };
  });
