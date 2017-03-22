angular
  .module('app', [
    'app.pages',
    'app.templates',
    'ui.router'
  ])
  .config(($urlRouterProvider: ng.ui.IUrlRouterProvider) => {
    $urlRouterProvider.otherwise('/home');
  });

angular
  .module('app.pages', [
    'ui.router'
  ]);
