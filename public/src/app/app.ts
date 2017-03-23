angular
  .module('app', [
    'ui.router',
    'app.pages',
    'app.templates',
    'pascalprecht.translate'
  ])
  .config(($urlRouterProvider: ng.ui.IUrlRouterProvider) => {
    $urlRouterProvider.otherwise('/home');
  });
