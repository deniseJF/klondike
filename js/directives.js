  
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
     return {
         restrict: 'A',
         scope: {
             'enableDrag': '@'
         },
         link: function(scope, element, attr) {
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
                if(scope.enableDrag=='false')
                  return;

                 y = event.screenY - startY;
                 x = event.screenX - startX;
                 element.css({
                     top: y + 'px' ,
                     left:  x + 'px'
                 });

                 var possibleTargets = getIntersectingDroppableElements(element[0]);
                 scope.$emit('onElementDrag', element, possibleTargets);
             }

             function getIntersectingDroppableElements(element){
                 // TODO: tratar interseccao com elementos (cards) dentro do elemento droppable
                 var draggableRectangle = new Rectangle(element);
                 var droppableElements = document.getElementsByClassName("droppable");
                 var possibleTargets = [];
                 for(var i = 0; i < droppableElements.length; i++) {
                     var droppable = droppableElements[i];
                     var droppableRectangle = new Rectangle(droppable);
                     if (draggableRectangle.intersectsWith(droppableRectangle)){
                         possibleTargets.push(droppable)
                     }
                 }
                 return possibleTargets;
             }

             function mouseup() {
                 $document.unbind('mousemove', mousemove);
                 $document.unbind('mouseup', mouseup);
                 var possibleTargets = getIntersectingDroppableElements(element[0]);
                 scope.$emit('onElementDrop', element, possibleTargets);
             }
         }
     };
  }).directive('droppable', function($document) {
      return function(scope, element, attr) {

      }
  });
