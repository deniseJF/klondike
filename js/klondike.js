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
    this.zindex = -1;

    this.isTableauSequenceTo = function(other) {
        return other.faceUp && this.suit.color != other.suit.color && this.number != "K" &&
            (CARD_NUMBERS.indexOf(this.number) + 1) == CARD_NUMBERS.indexOf(other.number);
    }
    this.isFoundationSequenceTo = function(other) {
        return this.suit == other.suit && this.number != "A" &&
            CARD_NUMBERS.indexOf(this.number) == (CARD_NUMBERS.indexOf(other.number) + 1);
    }
}

function createStandardDeck() {
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

function CardPile(cards) {
    this.cards = cards;
    this.highlight = false;
}

function Klondike() {
    this.stock = new CardPile([]);
    this.waste = new CardPile([]);
    this.foundations = [new CardPile([]), new CardPile([]), new CardPile([]), new CardPile([])];
    this.tableaus = [];
    var klondike = this;

    this.init = function(){
        var deck = createStandardDeck();
        angular.forEach([1, 2, 3, 4, 5, 6, 7], function(numCards){
            var cards = deck.splice(0, numCards);
            cards[cards.length - 1].faceUp = true;
            klondike.tableaus.push(new CardPile(cards));
        });
        klondike.stock.cards = deck;
    };

    this.getPileContainingCard = function (card) {
        var piles = [this.waste].concat(this.foundations).concat(this.tableaus);
        var pileContainingCard = piles.filter(function(pile){
            return pile.cards.indexOf(card) >= 0;
        });
        if (pileContainingCard && pileContainingCard.length){
            return pileContainingCard[0];
        }
    }
    this.dealFromStock = function(){
        if(!this.stock.cards.length){
            this.stock.cards = this.waste.cards.splice(0).reverse().map(function(elem){
                elem.faceUp = false;
                return elem;
            });
        } else {
            var card = this.stock.cards.pop();
            card.faceUp = true;
            this.waste.cards.push(card);
        }
    };
    this.dehighlightAllCards = function() {
        var pile = this.tableaus.concat(this.foundations);
        angular.forEach(pile, function(pile){
            pile.highlight = false;
            angular.forEach(pile.cards, function(it) {
                it.highlight = false;
            });
        });
    }
    this.moveCardToPile = function(card, pile) {
        var pileContainingCard = this.getPileContainingCard(card);
        var index = pileContainingCard.cards.indexOf(card);
        angular.forEach(pileContainingCard.cards.splice(index), function(movingCard) {
            pile.cards.push(movingCard)
        });
        if(pileContainingCard.cards.length){
            pileContainingCard.cards[pileContainingCard.cards.length-1].faceUp = true;
        }
    }
    this.allowMoveToPile = function(card, pile, type) {
        var pileContainingCard = this.getPileContainingCard(card);
        if (pile == pileContainingCard) {
            return false;
        }
        if(type == 'tableau'){
            return this.allowMoveToTableau(card, pile);
        }
        if(type == 'foundation'){
            return this.allowMoveToFoundation(card, pile);
        }
        return false;
    }
    this.allowMoveToFoundation = function(card, pile) {
        if (pile.cards.length == 0) {
            return card.number == "A";
        }
        return card.isFoundationSequenceTo(pile.cards[pile.cards.length - 1]);
    }

    this.allowMoveToTableau = function(card, pile) {
        if (pile.cards.length == 0) {
            return card.number == "K";
        }
        return card.isTableauSequenceTo(pile.cards[pile.cards.length - 1]);
    }

    this.isSolved = function() {
        function and(x, y) { return x && y; }
        this.tableaus.map(function(tableau) {
            return tableau.cards.map(function(it){ return it.faceUp; }).reduce(and, true);
        }).reduce(and, true);
    }
}


