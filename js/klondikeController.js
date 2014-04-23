// depends on klondike.js
function KlondikeController($scope) {
    $scope.game = new Klondike();
    $scope.game.init();

    $scope.$on('onCardDblClick', function(event, card, element){
        moveToFoundationIfPossible(card, element);
        $scope.$apply();
    });

    $scope.$on('onElementDrag', function(event, element, possibleTargets) {
        $scope.game.dehighlightAllCards();
        var card = element.scope().card;
        var candidateForDropping = findCandidateForDropping(card, possibleTargets);
        if (candidateForDropping) {
            highlightCandidate(candidateForDropping);
        }
        $scope.$apply();
    });

    $scope.$on('onElementDrop', function(event, element, possibleTargets, draggingElements) {
        $scope.game.dehighlightAllCards();
        var card = element.scope().card;
        var candidateForDropping = findCandidateForDropping(card, possibleTargets);
        if (candidateForDropping) {
            $scope.game.moveCardToPile(card, candidateForDropping);
        } else {
            restoreDraggedElementsToInitialPositions(draggingElements);
        }
        $scope.$apply();
    });

    $scope.dealFromStock = function(){
        $scope.game.dealFromStock();
    };

    function findCandidateForDropping(card, possibleTargets) {
        var pileContainingCard = $scope.game.getPileContainingCard(card);
        return possibleTargets.map(function(elem) {
            return angular.element(elem).scope();
        }).filter(function(target) {
            return $scope.game.allowMoveToPile(card, target.pile, target.type);
        }).map(function(elem){
            return elem.pile;
        }).pop();
    }

    function restoreDraggedElementsToInitialPositions(draggingElements) {
        var elem;
        while (elem = draggingElements.pop()) {
            elem.element.css({
                top: elem.initialTop,
                left: elem.initialLeft,
                'z-index': elem.origZIndex
            });
        }
    }

    function highlightCandidate(candidateForDropping) {
        if (candidateForDropping.cards.length) {
            candidateForDropping.cards[candidateForDropping.cards.length - 1].highlight = true;
        } else {
            candidateForDropping.highlight = true;
        }
    }

    function moveToFoundationIfPossible(card, element) {
        var candidates = $scope.game.foundations.filter(function(foundation) {
            return $scope.game.allowMoveToFoundation(card, foundation);
        });
        if (candidates && candidates.length){
            animateMoveToFoundation(element.children(), candidates[0], function(){
                $scope.game.moveCardToPile(card, candidates[0]);
            });
        }
    }

    function animateMoveToFoundation(cardElem, foundationPile, callback) {
        var foundationElem = findFoundationElement();
        console.log('cardElem', cardElem);
        console.log('foundationElem', foundationElem);
        var cardBox = cardElem[0].getBoundingClientRect();
        var foundationBox = foundationElem[0].getBoundingClientRect();
        var dx = (foundationBox.left - cardBox.left) / 10;
        var dy = (foundationBox.top - cardBox.top) / 10;
        moveCardCloserToFoundation();
        function moveCardCloserToFoundation(){
            var cardBox = cardElem[0].getBoundingClientRect();
            if (cardArrivedAtFoundationBox(cardBox, foundationBox)){
                callback();
            } else {
                cardElem.css('top', parseInt(cardElem.css('top')) + dy + 'px');
                cardElem.css('left', parseInt(cardElem.css('left')) + dx + 'px');
                setTimeout(moveCardCloserToFoundation, 20);
            }
        }
        function cardArrivedAtFoundationBox(cardBox, foundationBox) {
            if (dx > 0) {
                return ((cardBox.top - foundationBox.top) <= 1
                        && (cardBox.left - foundationBox.left) >= 1);
            } else {
                return ((cardBox.top - foundationBox.top) <= 1
                        && (cardBox.left - foundationBox.left) <= 1);
            }
        }

        function findFoundationElement() {
            var foundationElems = document.getElementsByClassName("foundation");
            for (var i = 0; i < foundationElems.length; i++) {
                var $elem = angular.element(foundationElems[i]);
                if ($elem.scope().pile === foundationPile) {
                    return $elem;
                }
            }
            console.log('ERROR: could not find DOM elem for foundationPile:', foundationPile);
        }
    }
}

var Rectangle = function(element){
    var boundings = element.getBoundingClientRect();

    this.left = boundings.left;
    this.right = boundings.right;
    this.top = boundings.top;
    this.bottom = boundings.bottom;

    this.intersectsWith = function(other) {
        return !(other.left > this.right || 
           other.right < this.left || 
           other.top > this.bottom ||
           other.bottom < this.top);
    }

    this.intersectingArea = function(other){
        function max(x, y) {
            if (x > y) {
                return x;
            }
            return y;
        }
        function min(x, y) {
            if (x < y) {
                return x;
            }
            return y;
        }
        var left = max(this.left, other.left);
        var right = min(this.right, other.right);
        var bottom = max(this.bottom, other.bottom);
        var top = min(this.top, other.top);
        if (left < right && bottom < top) {
            return (bottom - top) * (right - left);
        }
        return 0;
    }
}
