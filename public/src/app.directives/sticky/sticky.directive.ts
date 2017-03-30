module app.directives {
  'use strict';

  interface IStickyDirectiveAttributes extends ng.IAttributes {
    offset: string;
  }

  // wrapper around http://leafo.net/sticky-kit/#reference
  // TODO: add options
  class StickyDirective implements ng.IDirective {

    static factory(): ng.IDirectiveFactory {
      return () => new StickyDirective();
    }

    link: ng.IDirectiveLinkFn = (
      $scope: ng.IScope,
      $elem: JQuery,
      $attrs: IStickyDirectiveAttributes
    ) => {
      // default offset top is 0
      let offset: number = +$attrs.offset || 0;

      $($elem).stick_in_parent({ offset_top: offset });
    };
  }

  angular
    .module('app.pages')
    .directive('sticky', StickyDirective.factory());
}
