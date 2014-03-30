  
angular.module('klondike', ['klondike.directive', 'ngTouch']).
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
        restrict: "E",
        templateUrl: 'templates/card.html',
        scope: {
            'card': '=',
            'position': '@',
            'zoomIndex': '@'
        },
        link: function(scope, element, attr) {
            element.on('dblclick', function(event){
                scope.$emit('onCardDblClick', scope.card);
            });
            element.on('touchend', function(event){
                scope.$emit('onCardDblClick', scope.card);
            });
        }
    };
 }).directive('draggable', function($document) {
     return {
         restrict: 'A',
         scope: {
             'enableDrag': '@'
         },
         link: function(scope, element, attr) {
             var startX = 0, startY = 0, x = 0, y = 0, initialTop = 0, initialLeft = 0;
             var originalZoomIndex = 0;
             element.css({
                 position: 'relative',
                 cursor: 'pointer'
             });

             element.on('mousedown touchstart', mousedown);

             function getCoordinates(event) {
                 var touches = event.touches && event.touches.length ? event.touches : [event];
                 var e = (event.changedTouches && event.changedTouches[0]) ||
                     (event.originalEvent && event.originalEvent.changedTouches &&
                      event.originalEvent.changedTouches[0]) ||
                      touches[0].originalEvent || touches[0];

                 return {
                     x: e.clientX,
                     y: e.clientY
                 };
             }

             function mousedown(event){
                 event.preventDefault();
                 initialTop = element.css('top');
                 initialLeft = element.css('left');
                 y = parseInt(element.css('top'));
                 var coords = getCoordinates(event);
                 startX = coords.x - x;
                 startY = coords.y - y;
                 originalZoomIndex = element.css('z-index');
                 $document.on('mousemove touchmove', mousemove);
                 $document.on('mouseup touchend', mouseup);
             }

             function mousemove(event) {
                if(scope.enableDrag=='false')
                  return;

                 var coords = getCoordinates(event);
                 x = coords.x - startX;
                 y = coords.y - startY;
                 element.css({
                     top: y + 'px' ,
                     left:  x + 'px',
                     'z-index': 1000
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
                 $document.unbind('mousemove touchmove', mousemove);
                 $document.unbind('mouseup touchend', mouseup);
                 var possibleTargets = getIntersectingDroppableElements(element[0]);
                 element.css('z-index', originalZoomIndex);
                 x = 0, y = 0;
                 scope.$emit('onElementDrop', element, possibleTargets, initialTop, initialLeft);
             }
         }
     };
  });
