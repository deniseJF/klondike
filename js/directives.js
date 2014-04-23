  
angular.module('klondike', ['klondike.directive', 'ngTouch']).
run(function() {
});

angular.module('klondike.directive', []).directive(
    'cardPile', function() {
    return {
        restrict: "E",
        templateUrl: 'templates/cardPile.html',
        scope: {
            'type': '@',
            'pile': '=',
            'click': '&',
        },
        link: function(scope, element, attr) {
            element.on('click touchstart', function(event){
                scope.click();
            });
        }
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
             var draggingElements = [];
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

             function storeElementCoordinates(coords, element) {
                 var top = element.css('top');
                 var left = element.css('left') ? element.css('left') : 0;
                 draggingElements.push({
                     element: element,
                     initialTop: top,
                     initialLeft: left,
                     startX: coords.x - parseInt(left),
                     startY: coords.y - parseInt(top),
                     origZIndex: element.css('z-index')
                 });
             }

             function getNextElement(element) {
                 // parent() gets the card, next() gets next card,
                 // and children() gets the next draggable div inside card
                 return element.parent().next().children();
             }

             function getElementsToDragFrom(elem) {
                 var elements = [];
                 while (elem.length) {
                     elements.push(elem);
                     elem = getNextElement(elem);
                 }
                 return elements;
             }

             function mousedown(event){
                 event.preventDefault();

                 var coords = getCoordinates(event);
                 var elements = getElementsToDragFrom(element);
                 for (var i = 0; i < elements.length; i++){
                     storeElementCoordinates(coords, elements[i]);
                 }
                 $document.on('mousemove touchmove', mousemove);
                 $document.on('mouseup touchend', mouseup);
             }

             function mousemove(event) {
                if(scope.enableDrag=='false')
                  return;

                 var coords = getCoordinates(event);
                 element.css('cursor', 'move');
                 for (var i = 0; i < draggingElements.length; i++) {
                     var elem = draggingElements[i];
                     var newX = coords.x - elem.startX;
                     var newY = coords.y - elem.startY;
                     elem.element.css({
                         'z-index': 1000,
                         top: newY + 'px' ,
                         left: newX + 'px',
                     });
                 }

                 var possibleTargets = getIntersectingDroppableElements(element[0]);
                 scope.$emit('onElementDrag', element, possibleTargets);
             }

             function mouseup() {
                 $document.unbind('mousemove touchmove', mousemove);
                 $document.unbind('mouseup touchend', mouseup);
                 element.css('cursor', 'pointer');
                 var possibleTargets = getIntersectingDroppableElements(element[0]);
                 scope.$emit('onElementDrop', element, possibleTargets, draggingElements);
             }

             function getIntersectingDroppableElements(domElement){
                 var draggableRectangle = new Rectangle(domElement);
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

         }
     };
  });
