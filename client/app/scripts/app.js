/**
 * Copyright (c)
 * 2014 Tsuyoyo. All Rights Reserved.
 */
'use strict';

angular.module('clientApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.sortable'
])
  .config(function ($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/categoryview/:id', {
        templateUrl: 'views/categoryview.html',
        controller: 'CategoryviewCtrl'
      })
      .when('/userview/:id', {
        templateUrl: 'views/userview.html',
        controller: 'UserviewCtrl'
      })
      .when('/player/:videoId', {
        templateUrl: 'views/player.html',
        controller: 'PlayerCtrl'
      })
      .when('/signup/:registerKey?', {
        templateUrl: 'views/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/signin/:signinPass?', {
        templateUrl: 'views/signin.html',
        controller: 'SigninCtrl'
      })
      .when('/tagview/', {
        templateUrl: 'views/tagview.html'
      })
      .when('/commentview/', {
        templateUrl: 'views/commentview.html'
      })
      .when('/ratingmanage/', {
        templateUrl: 'views/ratingmanage.html',
        controller: 'RatingmanageCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

  });


