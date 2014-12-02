/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp')
  .controller('UserviewCtrl', function ($scope, $routeParams) {

    $scope.userId = $routeParams.id;

  });
