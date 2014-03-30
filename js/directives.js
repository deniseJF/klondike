  
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
        }
    };
 }).directive('draggable', ['$document', '$swipe', function($document, $swipe) {
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
             $swipe.bind(element, {
                 start: mousedown,
                 move: mousemove,
                 end: mouseup
             })

             function mousedown(event){
                 initialTop = element.css('top');
                 initialLeft = element.css('left');
                 y = parseInt(element.css('top'));
                 startX = event.x - x;
                 startY = event.y - y;
                 originalZoomIndex = element.css('z-index');
             }

             function mousemove(event) {
                if(scope.enableDrag=='false')
                  return;

                 y = event.y - startY;
                 x = event.x - startX;
                 element.css({
                     top: y + 'px' ,
                     left:  x + 'px',
                     'z-index': 1000
                 });

                 var possibleTargets = getIntersectingDroppableElements(element[0]);
                 scope.$emit('onElementDrag', element, possibleTargets);
             }

             function getIntersectingDroppableElements(element){
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
                 var possibleTargets = getIntersectingDroppableElements(element[0]);
                 element.css('z-index', originalZoomIndex);
                 x = 0, y = 0;
                 scope.$emit('onElementDrop', element, possibleTargets, initialTop, initialLeft);
             }
         }
     };
  }]);
