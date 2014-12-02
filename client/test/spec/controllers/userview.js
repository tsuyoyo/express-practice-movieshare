'use strict';

describe('Controller: UserviewCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var UserviewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UserviewCtrl = $controller('UserviewCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
