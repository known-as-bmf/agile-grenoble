angular
  .module('app', [
    // vendor dependancies
    'ui.router',
    'pascalprecht.translate',
    'duScroll',
    // app
    'app.templates',
    'app.pages',
    'app.directives',
    'app.services'
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
