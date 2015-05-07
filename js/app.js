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