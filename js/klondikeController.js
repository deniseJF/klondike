// depends on klondike.js
function KlondikeController($scope) {
    $scope.game = new Klondike();
    $scope.game.init();

    $scope.$on('onCardDblClick', function(event, card){
        moveToFoundationIfPossible(card);
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
        $scope.$apply();
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

    function moveToFoundationIfPossible(card) {
        var candidates = $scope.game.foundations.filter(function(foundation) {
            return $scope.game.allowMoveToFoundation(card, foundation);
        });
        if (candidates && candidates.length){
            $scope.game.moveCardToPile(card, candidates[0]);
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
