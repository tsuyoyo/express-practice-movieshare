/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .directive('tagselector', function (Webapi) {
    return {

      template:
        '<div>' +
        '  <select class="form-control" ng-model="selectedTag" ' +
        '          ng-options="tag as tag.name for tag in tags" />' +
        '</div>',

      restrict: 'E',

      link: function (scope) {

        scope.selectedTag = null;

        scope.tags = null;

        Webapi.allTags(function(tags) {

          if (tags && 0 < tags.length) {

            scope.selectedTag = tags[0];
          }

          scope.tags = tags;
        });
      },

    };
  });
