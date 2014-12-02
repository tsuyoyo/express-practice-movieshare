'use strict';

describe('Controller: RatingmanageCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var RatingmanageCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RatingmanageCtrl = $controller('RatingmanageCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
