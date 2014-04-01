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
        var deck = createDeck();
        angular.forEach([1, 2, 3, 4, 5, 6, 7], function(numCards){
            var cards = deck.splice(0, numCards);
            cards[cards.length - 1].faceUp = true;
            klondike.tableaus.push(new CardPile(cards));
        });
        klondike.stock.cards = deck;
    };
}

function KlondikeController($scope) {  
    $scope.game = new Klondike();
    $scope.game.init();

    function getPileContainingCard(card) {
        var piles = [$scope.game.waste].concat($scope.game.foundations).concat($scope.game.tableaus);
        var pileContainingCard = piles.filter(function(pile){
            return pile.cards.indexOf(card) >= 0;
        });
        if (pileContainingCard && pileContainingCard.length){
            return pileContainingCard[0];
        }
    }

    function isFeasibleFoundation(card, pile) {
        if (pile.cards.length == 0) {
            return card.number == "A";
        }
        return card.isFoundationSequenceTo(pile.cards[pile.cards.length - 1]);
    }

    function isFeasibleTableau(card, pile) {
        if (pile.cards.length == 0) {
            return card.number == "K";
        }
        return card.isTableauSequenceTo(pile.cards[pile.cards.length - 1]);
    }

    function findCandidateForDropping(card, possibleTargets) {
        var pileContainingCard = getPileContainingCard(card);
        var cardsForPossibleTargets = possibleTargets.map(function(elem) {
            return angular.element(elem).scope();
        }).filter(isFeasibleTarget).map(function(elem){
            return elem.pile;
        });
        if (cardsForPossibleTargets) {
            return cardsForPossibleTargets[0];
        }

        function isFeasibleTarget(target) {
            if (target.pile == pileContainingCard) {
                return false;
            }
            if(target.type == 'tableau'){
                return isFeasibleTableau(card, target.pile);
            }
            if(target.type == 'foundation'){
                return isFeasibleFoundation(card, target.pile);
            }
        }
    }

    function dehighlightAllCards() {
        var pile = $scope.game.tableaus.concat($scope.game.foundations);
        angular.forEach(pile, function(pile){
            pile.highlight = false;
            angular.forEach(pile.cards, function(it) {
                it.highlight = false;
            });
        });
    }

    function highlightCandidate(candidateForDropping) {
        if (candidateForDropping) {
            if (candidateForDropping.cards.length) {
                candidateForDropping.cards[candidateForDropping.cards.length - 1].highlight = true;
            } else {
                candidateForDropping.highlight = true;
            }
        }
        $scope.$apply();
    }

    $scope.$on('onCardDblClick', function(event, card){
        var candidates = $scope.game.foundations.filter(function(foundation) {
            return isFeasibleFoundation(card, foundation);
        });
        if (candidates && candidates.length){
            moveCardToPile(card, candidates[0]);
        }
        $scope.$apply();
    });

    $scope.$on('onElementDrag', function(event, element, possibleTargets) {
        dehighlightAllCards();
        var card = element.scope().card;
        var candidateForDropping = findCandidateForDropping(card, possibleTargets);
        highlightCandidate(candidateForDropping);
    });

    function moveCardToPile(card, pile) {
        var pileContainingCard = getPileContainingCard(card);
        var index = pileContainingCard.cards.indexOf(card);
        angular.forEach(pileContainingCard.cards.splice(index), function(movingCard) {
            pile.cards.push(movingCard)
        });
        if(pileContainingCard.cards.length){
            pileContainingCard.cards[pileContainingCard.cards.length-1].faceUp = true;
        }
    }

    $scope.$on('onElementDrop', function(event, element, possibleTargets, initialTop, initialLeft) {
        dehighlightAllCards();
        var card = element.scope().card;
        var candidateForDropping = findCandidateForDropping(card, possibleTargets);
        if (candidateForDropping) {
            moveCardToPile(card, candidateForDropping);
        } else {
            angular.element(element).css({
                top: initialTop,
                left: initialLeft
            });
        }
        $scope.$apply();
    });

    $scope.dealFromStock = function(){
        if(!$scope.game.stock.cards.length){
            $scope.game.stock.cards = $scope.game.waste.cards.splice(0).reverse().map(function(elem){
                elem.faceUp = false;
                return elem;
            });        
        }else{
            var card = $scope.game.stock.cards.pop();
            card.faceUp = true;
            $scope.game.waste.cards.push(card);
        }
    };
}
