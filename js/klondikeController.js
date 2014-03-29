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

    this.intersectsWith = function(other){
        return !(other.left > this.right || 
           other.right < this.left || 
           other.top > this.bottom ||
           other.bottom < this.top);
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

    $scope.$on('onElementDrag', function(event, card, possibleTargets) {
        card = card.scope().card;
        possibleTargets = possibleTargets.map(function(elem) {
            return angular.element(elem).scope().cards;
        });
        console.log('card dragged', card);
        console.log('possible targets:', possibleTargets);
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
