/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope, $location, $cookieStore, Constants, Webapi) {

    $scope.categories = null;

    var user = $cookieStore.get(Constants.Cookie.USER);

    var setCategory = function(categories) {

      $scope.categories = categories;

    };

    if (user && 'admin' === user.type) {

      Webapi.allCategories(setCategory);

    } else {

      Webapi.allPublicCategories(setCategory);

    }


  });
