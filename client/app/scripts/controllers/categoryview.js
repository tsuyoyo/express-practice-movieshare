/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .controller('CategoryviewCtrl', function ($scope, $routeParams) {

    $scope.categoryId = $routeParams.id;

  });
