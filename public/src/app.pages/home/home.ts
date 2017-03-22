module app.pages {
  'use strict';

  angular
    .module('app.pages')
    .config(($stateProvider: ng.ui.IStateProvider) => {
      $stateProvider.state('shell.home', {
        url: '/home',
        templateUrl: 'app.pages/home/home.html'
      });
    });
}
