  
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

      element.on('mousedown', mousedown);

      function mousedown(event){
        // Prevent default dragging of selected content
        y = parseInt(element.css('top'));
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

        var intersectingElement = getIntersectingDroppableElement(element[0]);
        if(intersectingElement){
          // TODO: alterar para indicar visualmente este elemento como dropavel
          // de acordo com as regras do jogo
          angular.element(intersectingElement).css("border","1px solid red");
        }
      }

      function getIntersectingDroppableElement(element){
        // TODO: alterar para retornar uma lista de elementos intersectando
        var draggableRectangle = new Rectangle(element);
        var droppableElements = document.getElementsByClassName("droppable");
        for(var i = 0; i < droppableElements.length; i++) {
          var droppable = droppableElements[i];
          var droppableRectangle = new Rectangle(droppable);
            if(draggableRectangle.intersectsWith(droppableRectangle)){
              return droppable;
            }
        }
      }

      function mouseup() {
        $document.unbind('mousemove', mousemove);
        $document.unbind('mouseup', mouseup);
      }
    };
  }).directive('droppable', function($document) {
      return function(scope, element, attr) {

      }
  });
