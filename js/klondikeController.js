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



function Card(suit, number) {
    this.suit = suit;
    this.number = number;
    this.faceUp = false;
}

function createDeck() {
    var cards = [];
    angular.forEach(Suits, function(suit) {
        angular.forEach(["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"], function(number){
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
        function isFeasibleTarget(target) {
            if (target == tableauContainingCard) {
                return false;
            }
            // TODO: corrigir essa logica e mover para Card
            return (target && target[target.length - 1].suit != card.suit);
        }
        var cardsForPossibleTargets = possibleTargets.map(function(elem) {
            return angular.element(elem).scope().cards;
        }).filter(isFeasibleTarget);
        if (cardsForPossibleTargets) {
            return cardsForPossibleTargets[0];
        }
    }

    $scope.$on('onElementDrag', function(event, element, possibleTargets) {
        var card = element.scope().card;
        console.log('dragged', card);
        var candidateForDroppping = findCandidateForDropping(card, possibleTargets);
        console.log('candidateForDroppping', candidateForDroppping);
        // TODO: colore a ultima carta
    });

    $scope.play = function(card) {
        // var possibleTarget = findPossibleTarget(card);
        // if (card.isNext(target)) {
        //     target.highlight = true;
        // }
        console.log('playing ... ');
    }

    console.log('game', $scope.game);
}
