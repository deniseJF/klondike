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

function Klondike() {
    this.stock = [];
    this.waste = [];
    this.foundations = [[], [], [], []];
    this.tableaus = [];
    var klondike = this;

    this.init = function(){
        var deck = createDeck();
        angular.forEach([1, 2, 3, 4, 5, 6, 7], function(numCards){
            klondike.tableaus.push(deck.splice(0, numCards));
        });
        klondike.stock = deck;
    };
}

function KlondikeController($scope) {  
    $scope.game = new Klondike();
    $scope.game.init();

    console.log('game', $scope.game);
}
