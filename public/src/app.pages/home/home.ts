module app.pages {
  'use strict';

  class HomeCtrl {

    constructor(
      private $scope: ng.IScope
    ) {
      this.text = 'Lolilol';
    }

    private text: string;
  }

  angular
    .module('app.pages')
    .config(($stateProvider: ng.ui.IStateProvider) => {
      $stateProvider.state('shell.home', {
        url: '/home',
        templateUrl: 'app.pages/home/home.html',
        controller: HomeCtrl,
        controllerAs: 'vm'
      });
    });
}
