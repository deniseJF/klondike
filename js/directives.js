  
angular.module('klondike', ['klondike.directive']).
run(function() {
});


angular.module('klondike.directive', []).directive(
	'cardPile', function() {
	return {
	  	templateUrl: 'templates/cardPile.html',
	    scope: {
		    'text': '@',
		    'type': '@',
		    'card': '='
		},
	  	restrict: "E"
	};
 });