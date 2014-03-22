var Suits = ['hearts', 'diamonds', 'spades', 'clubs'];

function Card(suit, number) {
    this.suit = suit;
    this.number = number;
}

function Deck() {
    this.cards = [];

    var $deck = this;
    this.init = function() {
        $deck.cards = [];
        angular.forEach(Suits, function(suit) {
            angular.forEach(["A", 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K"], function(number){
                $deck.cards.push(new Card(suit, number));
            })
        });
    }
}

function KlondikeController($scope) {  
    $scope.deck = new Deck();
    $scope.deck.init();
    console.log('deck', $scope.deck);
}
