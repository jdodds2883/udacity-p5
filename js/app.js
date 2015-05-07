// Defines the data for the (AOI) Areas of Interest
var markerClass = function(marker, name, category, position) {
  this.marker = marker,
  this.name = name,
  this.category = category,
  this.position = position
};

// Map View
function MapViewModel() {
  // Variables needed to start map
  var self = this; 
  var map;
  var service;
  var newLocation; 
  var infowindow;
  var myneighMark = [];
  var locations = []; 
  var Neighborhood = "Seattle"; // The initial search on load
  self.myBoolean=ko.observable(true); // Used to Toggle the (AOI)
  self.topPicksList = ko.observableArray([]); // popular places in defined neighbor hood
  self.myFilteredList = ko.observableArray(self.topPicksList()); // Filters
  self.neighborhood = ko.observable(Neighborhood); // Search Location
  self.keyword = ko.observable(''); // Search Keyword 
  
  // Start Map
  initMap();

  // Defines how large the map will be on start
  function initMap() {
    var mapOptions = {
      zoom: 14,
      disableDefaultUI: true
    };
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);
    infowindow = new google.maps.InfoWindow();
  }

  self.setToggle = function() {
    if (self.myBoolean() == true) {
      self.myBoolean(false);
    }else{
      self.myBoolean(true);
    }
  };
  
  // Resize the map to the proper window size height
  self.mapSize = ko.computed(function() {
    $("#map").height($(window).height());
  }); 

  // Once your location is centered - triggers the markers on the map
  self.displayMarkers = ko.computed(function() {
    filterMarkers(self.keyword().toLowerCase());
  });

  // Filter the stored markers
  function filterMarkers(keyword) {
    for (var i in locations) {
      if (locations[i].marker.map === null) {
        locations[i].marker.setMap(map);
      }
      if (locations[i].name.indexOf(keyword) === -1 &&
        locations[i].category.indexOf(keyword) === -1) {
        locations[i].marker.setMap(null);
      }
    }
  }

  // Update Location
  self.computedNeighborhood = ko.computed(function() {
    if (self.neighborhood() != '') {
      if (locations.length > 0) {
        removelocations();
      }
      removeNeighborhoodMarker();
      requestNeighborhood(self.neighborhood());
      self.keyword('');
    }
  });

  // Remove Locations
  function removelocations() {
    for (var i in locations) {
      locations[i].marker.setMap(null);
      locations[i].marker = null;
    }
    while (locations.length > 0) {
      locations.pop();
    }
  }

  // Remove existing Location markers
  function removeNeighborhoodMarker() {
    for (var i in myneighMark) {
      myneighMark[i].setMap(null);
      myneighMark[i] = null;
    }
    while (myneighMark.length > 0) {
      myneighMark.pop();
    }
  }
