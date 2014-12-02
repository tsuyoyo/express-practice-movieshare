/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .directive('actionbar', function ($cookieStore, $location, Webapi, Constants) {
    return {
      templateUrl: 'views/directives/actionbar.html',

      restrict: 'E',

      link: function(scope) {

        var username;

        scope.getUsername = function() {
          if (username) {
            return username;
          } else {
            return 'Guest';
          }
        };

        scope.cachedUser = $cookieStore.get(Constants.Cookie.USER);

        // Redirect to signin page if there's no cached user info
        if (!scope.cachedUser) {
          $location.path('signin');
          return;
        }

        scope.signout = function() {
          $cookieStore.remove(Constants.Cookie.USER);
          scope.cachedUser = null;
          username = null;

          $location.path('signin');
        };

        if (scope.cachedUser) {
          username = scope.cachedUser.name;
        }

      }
    };
  });
