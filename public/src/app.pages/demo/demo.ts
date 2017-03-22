module app.pages {
  'use strict';

  export interface IDemoCtrl { }

  export class DemoCtrl implements IDemoCtrl {
    constructor(
      private $scope: ng.IScope,
      private demoService: IDemoService
    ) { }
  }

  export interface IDemoService {
    toggleExcited(): void;
    isExcited(): boolean;
  }

  export class DemoService implements IDemoService {
    private excited: boolean = false;

    toggleExcited(): void {
      this.excited = !this.excited;
    }

    isExcited(): boolean {
      return this.excited;
    }
  }

  angular
    .module('app.pages')
    .controller('demoCtrl', DemoCtrl)
    .service('demoService', DemoService)
    .config(($stateProvider: ng.ui.IStateProvider) => {
      $stateProvider.state('shell.demo', {
        url: '/demo',
        templateUrl: 'app.pages/demo/demo.html',
        controller: DemoCtrl,
        controllerAs: 'demoCtrlVM'
      });
    });
}
