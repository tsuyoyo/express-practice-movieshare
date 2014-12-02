'use strict';

describe('Controller: TagviewCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var TagviewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TagviewCtrl = $controller('TagviewCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
