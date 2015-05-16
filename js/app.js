// Checks for internet connection 
function doesConnectionExist() {
  var xhr = new XMLHttpRequest();
  var file = "index.html";
  var randomNum = Math.round(Math.random() * 10000);
  xhr.open('HEAD', file + "?rand=" + randomNum, false);
  try {
	 xhr.send();

	 if (xhr.status >= 200 && xhr.status < 304) {
		return true;
	 } else {
		return false;
	 }
  } catch (e) {
	 return false;
  }
}

// Defines the data for the (AOI) Areas of Interest
var markerClass = function(marker, name, category, position) {
  this.marker = marker;
  this.name = name;
  this.category = category;
  this.position = position;
};

// Map View
function MapSearchLocation() {
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
      zoom: 16,
      disableDefaultUI: true
    };
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);
    infowindow = new google.maps.InfoWindow();
  }

  self.setToggle = function() {
    if (self.myBoolean() === true) {
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
	// Check internet connection
	var conn = doesConnectionExist();
	if(conn === false) {
		alert("You have no internet connection");
	}
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

  // Request Location Data from PlaceService
  function requestNeighborhood(neighborhood) {
    var request = {
      query: neighborhood
    };
    service = new google.maps.places.PlacesService(map);
    service.textSearch(request, neighborhoodCallback);
  }

  // Call back method for Location
  function neighborhoodCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      getInformation(results[0]);
    }
  }

  // Trigger click event for markers that are clicked
  self.clickMarker = function(venue) {
    var venueName = venue.venue.name.toLowerCase();
    for (var i in locations) {
      if (locations[i].name === venueName) {
        google.maps.event.trigger(locations[i].marker, 'click');
        map.panTo(locations[i].position);
      }
    }
  };

  // Update List based on Search Keyword
  self.displayList = ko.computed(function() {
    var venue;
    var list = [];
    var keyword = self.keyword().toLowerCase();
    for (var i in self.topPicksList()) {
      venue = self.topPicksList()[i].venue;
      if (venue.name.toLowerCase().indexOf(keyword) != -1 ||
        venue.categories[0].name.toLowerCase().indexOf(keyword) != -1) {
        list.push(self.topPicksList()[i]);
      }
    }
    self.myFilteredList(list);
  });

  // Set markers on map, Request popular places from FourSquare API
  function getInformation(data) {
    var lat = data.geometry.location.lat();
    var lng = data.geometry.location.lng();
    var name = data.name;
    newLocation = new google.maps.LatLng(lat, lng);
    map.setCenter(newLocation);

    // Location marker
    var marker = new google.maps.Marker({
      map: map,
      position: data.geometry.location,
      title: name
    });
    myneighMark.push(marker);

    // Location marker listener
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(name);
      infowindow.open(map, marker);
    });

    // Request Popular Places -- pulled from foursquare //https://api.foursquare.com/v2/venues/search?ll=40.7,-74&client_id=CLIENT_ID&client_secret=CLIENT_SECRET&v=YYYYMMDD
    foursquareBaseUri = "https://api.foursquare.com/v2/venues/explore?ll=";
    baseLocation = lat + ", " + lng;
    
	extraParams = "&limit=20&section=topPicks&day=any&time=any&locale=en&client_id=WQZJWHGHCD1AMUKZOXNBL0Y42OIHBDUU3SHXE3US2ENFDQMQ&client_secret=UR3CS2BXS2Z13UUMT3LSOP3ZKWPOI1F5MAT4VCVUAKR3B4UA&v=20150507";
    foursquareQueryUri = foursquareBaseUri + baseLocation + extraParams;

    $.getJSON(foursquareQueryUri, function(data) {
      self.topPicksList(data.response.groups[0].items);
      for (var i in self.topPicksList()) {
        createMarkers(self.topPicksList()[i].venue);
      }
    });
  }

  // Create Markers for Popular Places 
  function createMarkers(venue) {
    var lat = venue.location.lat;
    var lng = venue.location.lng;
    var name = venue.name;
    var address = venue.location.formattedAddress;
    var position = new google.maps.LatLng(lat, lng);
    var category = venue.categories[0].name;
    var myrating = venue.rating;

   
    // Popular Place Marker
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: name
    });
    locations.push(new markerClass(marker, name.toLowerCase(), category.toLowerCase(), position));


    // DOM element for pop up infowindow content
    var dom = '<strong>' + name + '</strong>' + '<br><br>' + category + '<br><br>' + address + '<br><br><p>FourSquare Rating: </p>' + myrating;
      
    
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(dom);
      infowindow.open(map, this);
      map.panTo(position);
    });
  }
}


// Start the Map
$(function() {
  ko.applyBindings(new MapSearchLocation());
});