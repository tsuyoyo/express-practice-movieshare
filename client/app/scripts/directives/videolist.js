/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .directive('videolist', function (Webapi, $location) {
    return {
      templateUrl: 'views/directives/videolist.html',

      restrict: 'E',

      scope: true,

      link: function postLink(scope, element, attrs) {

        scope.videoList = [];

        scope.listTitle = null;

        scope.listType = null;

        scope.isHighlight = ('highlight' in attrs) ? true : false;

        // When the list is highlight (only limited items are shown),
        // title takes to full list.
        scope.onTitleClicked = function() {
          if (attrs.category) {
            $location.path('/categoryview/' + attrs.category);
          } else if (attrs.user) {
            $location.path('/userview/' + attrs.user);
          } else if (attrs.tag) {
            $location.path('/tagview/' + attrs.tag);
          }
        };

        var setVideo = function(videos) {
          scope.videoList = videos;
          scope.videoList.forEach(loadVideoInfo);
        };

        var loadVideoInfo = function(video) {
          // User name
          Webapi.user(video.userid, function(user) {
            video.username = user.name;
          });

          // Comments num
          Webapi.comments(video._id, function(comments) {
            video.commentNum = comments.length;
          });

          // Likes num
          Webapi.likesNum(video._id, function(num) {
            video.likeNum = num;
          });

          // Category name
          Webapi.category(video.categoryid, function(category) {
            video.category = category.name;
          });
        };

        // Video list of category
        if (attrs.category) {

          Webapi.videoByCategory(attrs.category, setVideo);

          Webapi.category(attrs.category, function(category) {
            scope.listTitle = category.name;
          });

          scope.listType = 'category';
        }
        // Video list which the user updated
        else if (attrs.user) {

          Webapi.videoByUser(attrs.user, setVideo);

          Webapi.user(attrs.user, function(user) {
            scope.listTitle = 'Posted by ' + user.name;
          });

          scope.listType = 'user';
        }
        // Video list of what are tagged
        else if ('tag' in attrs) {

          var updateTag = function() {
            Webapi.videoByTag(scope.selectedTag._id, setVideo);

            Webapi.tag(scope.selectedTag._id, function(tag) {
              scope.listTitle = 'Videos tagged with ' + tag.name;
            });
          };

          scope.$watch('selectedTag', updateTag);

          updateTag();

          scope.listType = 'tag';
        }

      }

    };
  });
