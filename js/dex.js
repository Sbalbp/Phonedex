ons.platform.select('android');

var module = angular.module('pokedex', ['onsen', 'chart.js']);

// Filter for the name search form
module.filter('pkmnNameFilter', function() {
    return function(pkmns, searchTerm) {
    	out = [];
    	angular.forEach(pkmns, function(pkmn){
    		if( !searchTerm || pkmn.species.toLowerCase().includes(searchTerm.toLowerCase()) || (parseInt(searchTerm) && pkmn.id == parseInt(searchTerm)) ){
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
		"grass": "#2FB62F",		// Grass
		"poison": "#862D86",	// Poison
		"fire": "#FF751A",		// Fire
		"flying": "#99CEFF",	// Flying
		"water": "#005CE6",		// Water
		"bug": "#558000",		// Bug
		"normal": "#8C8C8C",	// Normal
		"fighting": "#B30000",	// Fighting
		"electric": "#FFD11A",	// Electric
		"ground": "#AC7339",	// Ground
		"psychic": "#FF33CC",	// Psychic
		"rock": "#997300",		// Rock
		"ice": "#99FFFF",		// Ice
		"dragon": "#751AFF",	// Dragon
		"ghost": "#6B00B3",		// Ghost
		"dark": "#262626",		// Dark
		"steel": "#A6A6A6",		// Steel
		"fairy": "#FFB3FF",		// Fairy
		"none": "#FFFFFF"
	};

	$scope.$watch('form.searchText', function(q) {
    	if ($scope.timeout) {
        	$timeout.cancel($scope.timeout);
    	}
      
      	if($scope.pkmns){
			out = [];
	    	angular.forEach($scope.pkmns, function(pkmn){
	    		if( !$scope.form.searchText || pkmn.species.toLowerCase().indexOf($scope.form.searchText.toLowerCase()) > -1 || (parseInt($scope.form.searchText) && pkmn.id == parseInt($scope.form.searchText)) ){
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
        		itemScope.item = $scope.filteredPkmns[index].id + " - " + $scope.filteredPkmns[index].species;
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
		$scope.nForme = 0;
		$scope.currentForme = $scope.currentPkmn.forms[$scope.nForme];
		$scope.pkmnName = $scope.currentPkmn.species;

		// Type background
		var type1 = $scope.currentForme.type[0];
		var type2 = $scope.currentForme.type.length > 1 ? $scope.currentForme.type[1] : "none";
		$scope.changeTypeBG(type1, type2);

		// Stats
		$scope.changeStats($scope.currentForme.stats);

		// Forms
		if($scope.currentPkmn.forms.length > 1){
			$scope.formeButtonSize = 100.0/($scope.currentPkmn.forms.length);
		}
		else{
			$scope.formeButtonSize = 100;
		}

		// Push page
		document.querySelector('#myNavigator').pushPage('pkmnStatsTab.html');
		
    }

    $scope.formeClicked = function($event, formeIndex) {
    	$scope.nForme = formeIndex;
		$scope.currentForme = $scope.currentPkmn.forms[$scope.nForme];

    	// Type background
		var type1 = $scope.currentForme.type[0];
		var type2 = $scope.currentForme.type.length > 1 ? $scope.currentForme.type[1] : "none";
		$scope.changeTypeBG(type1, type2);

		// Stats
		$scope.changeStats($scope.currentForme.stats);
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
  			$scope.currentForme && $scope.currentForme.stats ? [
  																base.hp,
  																base.attack,
  																base.defense,
  																base.spAtk,
  																base.spDef,
  																base.speed
  															] : [1,1,1,1,1,1]
  		];
	}

});