var Suits = [
    {
        name: 'hearts',
        symbol: '♥',
        color: 'red'
    }, 
    {   name: 'diamonds',
        symbol: '♦',
        color: 'red'
    },
    {   name: 'spades',
        symbol: '♠',
        color: 'black'
    },
    {   name: 'clubs',
        symbol: '♣',
        color: 'black'
    }
]

var CARD_NUMBERS = ["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"];

function Card(suit, number) {
    this.suit = suit;
    this.number = number;
    this.faceUp = false;
    this.highlight = false;
    this.isSequenceTo = function(other) {
        return other.faceUp && this.suit.color != other.suit.color && this.number != "K" &&
            (CARD_NUMBERS.indexOf(this.number) + 1) == CARD_NUMBERS.indexOf(other.number);
    }
}

function createDeck() {
    var cards = [];
    angular.forEach(Suits, function(suit) {
        angular.forEach(CARD_NUMBERS, function(number){
            cards.push(new Card(suit, number));
        })
    });
    return shuffle(cards);

    function shuffle(array) {
        var counter = array.length, temp, index;
        while (counter > 0) {
            index = Math.floor(Math.random() * counter);
            counter--;
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
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



function Klondike() {
    this.stock = [];
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableaus = [];
    var klondike = this;

    this.init = function(){
        var deck = createDeck();
        angular.forEach([1, 2, 3, 4, 5, 6, 7], function(numCards){
            var tableau = deck.splice(0, numCards);
            tableau[tableau.length - 1].faceUp = true;
            klondike.tableaus.push(tableau);
        });
        klondike.stock = deck;
    };
}

function KlondikeController($scope) {  
    $scope.game = new Klondike();
    $scope.game.init();

    function getTableauContainingCard(card) {
        for(var i =0; $scope.game.tableaus; i++) {
            var tableau = $scope.game.tableaus[i];
            if (tableau.indexOf(card) >= 0) {
                return tableau;
            }
        }
    }

    function findCandidateForDropping(card, possibleTargets) {
        var tableauContainingCard = getTableauContainingCard(card);
        var cardsForPossibleTargets = possibleTargets.map(function(elem) {
            return angular.element(elem).scope().cards;
        }).filter(isFeasibleTarget);
        if (cardsForPossibleTargets) {
            return cardsForPossibleTargets[0];
        }

        function isFeasibleTarget(target) {
            if (target == tableauContainingCard) {
                return false;
            }
            if (target.length == 0) {
                return card.number == "K";
            }
            return card.isSequenceTo(target[target.length - 1]);
        }
    }

    function dehighlightAllCards() {
        angular.forEach($scope.game.tableaus, function(tableau){
            angular.forEach(tableau, function(it) {
                it.highlight = false;
            });
        });
    }

    function highlightCandidate(candidateForDropping) {
        if (candidateForDropping.length) {
            candidateForDropping[candidateForDropping.length - 1].highlight = true;
        }
        $scope.$apply();
    }

    $scope.$on('onElementDrag', function(event, element, possibleTargets) {
        var card = element.scope().card;
        var candidateForDropping = findCandidateForDropping(card, possibleTargets);
        highlightCandidate(candidateForDropping);
    });

    $scope.$on('onElementDrop', function(event, element, possibleTargets) {
        dehighlightAllCards();
        var card = element.scope().card;
        var candidateForDropping = findCandidateForDropping(card, possibleTargets);
        if (candidateForDropping) {
            var tableauContainingCard = getTableauContainingCard(card);
            var index = tableauContainingCard.indexOf(card);
            var movingCards = tableauContainingCard.splice(index)
            angular.forEach(movingCards, function(movingCard) {
                candidateForDropping.push(movingCard)
            });
        } else {
            // TODO: voltar carta para origem
        }
        $scope.$apply();
    });

    console.log('game', $scope.game);
}
