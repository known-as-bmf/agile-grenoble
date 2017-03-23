angular
  .module('app', [
    'ui.router',
    'app.pages',
    'app.templates',
    'pascalprecht.translate'
  ])
  .config((
    $urlRouterProvider: ng.ui.IUrlRouterProvider,
    $translateProvider: ng.translate.ITranslateProvider
  ) => {
    // default router route
    $urlRouterProvider.otherwise('/home');
    // translation config
    $translateProvider.useStaticFilesLoader({
      prefix: 'string',
      suffix: 'string'
    });
  });
