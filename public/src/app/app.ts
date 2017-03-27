angular
  .module('app', [
    // vendor dependancies
    'ui.router',
    'pascalprecht.translate',
    // app
    'app.templates',
    'app.pages',
    'app.services',
  ])
  .config((
    $urlRouterProvider: ng.ui.IUrlRouterProvider,
    $translateProvider: ng.translate.ITranslateProvider
  ) => {
    // default router route
    $urlRouterProvider.otherwise('/home');
    // translation config
    $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/',
      suffix: '.json'
    });

    // $translateProvider.preferredLanguage('en_US');
    $translateProvider.preferredLanguage('fr_FR');
  });
