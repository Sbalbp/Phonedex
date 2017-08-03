ons.platform.select('android');

var module = angular.module('pokedex', ['onsen', 'chart.js']);

// Filter for the name search form
module.filter('pkmnNameFilter', function() {
    return function(pkmns, searchTerm) {
    	out = [];
    	angular.forEach(pkmns, function(pkmn){
    		if( !searchTerm || pkmn.ename.toLowerCase().includes(searchTerm.toLowerCase()) || (parseInt(searchTerm) && pkmn.id == parseInt(searchTerm)) ){
    			out.push(pkmn);
    		}
    	});
    	return out;
    };
});

module.controller('PokeCtrl', function($scope, $http){
	$scope.listName = "Pokemon List";
	$scope.statsName = "Pokemon Stats";
	$scope.pkmns = [];
	$scope.filteredPkmns = [];
	$scope.form = {};
	$scope.forme = 0;
	$scope.formeButtonSize = 100;
	$scope.types = {
		"\u8349": "#2FB62F",		// Grass
		"\u6bd2": "#862D86",		// Poison
		"\u708e": "#FF751A",		// Fire
		"\u98de\u884c": "#99CEFF",	// Flying
		"\u6c34": "#005CE6",		// Water
		"\u866b": "#558000",		// Bug
		"\u4e00\u822c": "#8C8C8C",	// Normal
		"\u683c\u6597": "#B30000",	// Fighting
		"\u7535": "#FFD11A",		// Electric
		"\u5730\u4e0a": "#AC7339",	// Ground
		"\u8d85\u80fd": "#FF33CC",	// Psychic
		"\u5ca9\u77f3": "#997300",	// Rock
		"\u51b0": "#99FFFF",		// Ice
		"\u9f99": "#751AFF",		// Dragon
		"\u5e7d\u7075": "#6B00B3",	// Ghost
		"\u6076": "#262626",		// Dark
		"\u94a2": "#A6A6A6",		// Steel
		"\u5996\u7cbe": "#FFB3FF",	// Fairy
		"none": "#FFFFFF"
	};

	$scope.$watch('form.searchText', function(q) {
    	if ($scope.timeout) {
        	$timeout.cancel($scope.timeout);
    	}
      
      	if($scope.pkmns){
			out = [];
	    	angular.forEach($scope.pkmns, function(pkmn){
	    		if( !$scope.form.searchText || pkmn.ename.toLowerCase().indexOf($scope.form.searchText.toLowerCase()) > -1 || (parseInt($scope.form.searchText) && pkmn.id == parseInt($scope.form.searchText)) ){
	    			out.push(pkmn);
	    		}
	    	});
	    	$scope.filteredPkmns = out;
	    	if($scope.MyDelegate.refresh){
	    		$scope.MyDelegate.refresh();
	    	}
		}
    });
	
	$scope.MyDelegate = {
    	countItems: function() {
        	// Return number of items.
        	if($scope.filteredPkmns){
        		return $scope.filteredPkmns.length;
        	}
        	else{
        		return 0;
        	}
      	},

      	configureItemScope: function(index, itemScope) {
        	// Initialize scope
        	if($scope.filteredPkmns[index]){
        		itemScope.item = $scope.filteredPkmns[index].id + " - " + $scope.filteredPkmns[index].ename;
        	}
        	else{
        		itemScope.item = "";
        	}
        	
      	},

	    destroyItemScope: function(index, itemScope) {
	        // Optional method that is called when an item is unloaded.
	    }
	};

	$http.get('./pokedex.json').then(function(data) {
   		$scope.pkmns = data.data;
   		$scope.form.searchText = "";
	});

	$scope.pkmnClicked = function($event, pkmn) {
		$scope.currentPkmn = $scope.pkmns[parseInt(pkmn.substring(0,3))-1];
		$scope.pkmnName = $scope.currentPkmn.ename;
		console.log($scope.currentPkmn);
		console.log($scope.pkmnName);
		console.log($scope.pkmnName.toLowerCase());
		$scope.forme = -1;

		// Type background
		var type1 = $scope.currentPkmn.type[0];
		var type2 = $scope.currentPkmn.type.length > 1 ? $scope.currentPkmn.type[1] : "none";
		$scope.changeTypeBG(type1, type2);

		// Stats
		$scope.changeStats($scope.currentPkmn.base);

		// Forms
		if($scope.currentPkmn.forms){
			$scope.formeButtonSize = 100.0/($scope.currentPkmn.forms.length+1);
		}
		else{
			$scope.formeButtonSize = 100;
		}

		// Push page
		document.querySelector('#myNavigator').pushPage('pkmnStatsTab.html');
		
    }

    $scope.formeClicked = function($event, formeIndex) {
    	$scope.forme = formeIndex;

    	if($scope.forme > -1){
	    	var type1 = $scope.currentPkmn.forms[$scope.forme].type[0];
			var type2 = $scope.currentPkmn.forms[$scope.forme].type.length > 1 ? $scope.currentPkmn.forms[$scope.forme].type[1] : "none";

			$scope.changeStats($scope.currentPkmn.forms[$scope.forme].base);
		}
		else{
			var type1 = $scope.currentPkmn.type[0];
			var type2 = $scope.currentPkmn.type.length > 1 ? $scope.currentPkmn.type[1] : "none";

			$scope.changeStats($scope.currentPkmn.base);
		}
		$scope.changeTypeBG(type1, type2);
    }

    // Radar graph
    $scope.height_chart = window.innerHeight*0.2;
    $scope.labels =["HP", "Attack", "Defense", "Sp. Attk.", "Sp. Def.", "Speed"];

  	$scope.data = [
  		$scope.currentPkmn && $scope.currentPkmn.base ? [$scope.currentPkmn.base.HP,$scope.currentPkmn.base.Attack,$scope.currentPkmn.base.Defense,$scope.currentPkmn.base["Sp.Atk"],$scope.currentPkmn.base["Sp.Def"],$scope.currentPkmn.base.Speed] : [1,1,1,1,1,1]/*,
    	[65, 59, 90, 81, 56, 55],
    	[28, 48, 40, 19, 96, 27]*/
  	];

  	$scope.chartOptions = {
  		responsive: true,
    	maintainAspectRatio: true,
    	scale: {
        	ticks: {
            	beginAtZero: true,
            	max: 255
        	}
    	}
	};

	$scope.changeTypeBG = function(type1, type2){
		$scope.pkmnDivBgColor = "#862D86";
		$scope.color1 = $scope.types[type1];
		$scope.color2 = $scope.types[type2];
		$scope.startGrad = type2 != "none" ? 25 : 50;
		$scope.endGrad = type2 != "none" ? 75 : 90;
	}

	$scope.changeStats = function(base){
		$scope.data = [
  			$scope.currentPkmn && $scope.currentPkmn.base ? [
  																base.HP,
  																base.Attack,
  																base.Defense,
  																base["Sp.Atk"],
  																base["Sp.Def"],
  																base.Speed
  															] : [1,1,1,1,1,1]
  		];
	}

});