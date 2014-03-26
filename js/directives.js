  
angular.module('klondike', ['klondike.directive']).
run(function() {
});


angular.module('klondike.directive', []).directive(
    'cardPile', function() {
    return {
          templateUrl: 'templates/cardPile.html',
        scope: {
            'type': '@',
            'cards': '='
        },
          restrict: "E"
    };
 }).directive(
    'card', function() {
    return {
        templateUrl: 'templates/card.html',
        scope: {
            'card': '=',
            'position': '@'
        },
        restrict: "E"
    };
 }).directive('draggable', function($document) {
    return function(scope, element, attr) {
      var startX = 0, startY = 0, x = 0, y = 0;
      element.css({
       position: 'relative',
       cursor: 'pointer'
      });

      console.log("position",element.style);
      element.on('mousedown', mousedown);

      function mousedown(event){
        // Prevent default dragging of selected content
        y = parseInt(angular.element(element[0]).css('top'));
        event.preventDefault();
        startX = event.screenX - x;
        startY = event.screenY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      }

      function mousemove(event) {
        y = event.screenY - startY;
        x = event.screenX - startX;
        element.css({
          top: y + 'px' ,
          left:  x + 'px'
        });
      }

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }
    };
  });
