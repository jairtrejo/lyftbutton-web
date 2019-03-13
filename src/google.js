let service;
let defaultLocation;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      defaultLocation = new google.maps.LatLng(
        coords.latitude, coords.longitude
      );
    }
  );
}

export function getSuggestions(query, userLocation = defaultLocation) {
  if (!service) {
    service = new google.maps.places.PlacesService(document.getElementById('attribution'));
  }

  return new Promise((resolve, reject) => {
    const request = {
      keyword: query,
      location: userLocation,
      radius: 50000,
      fields: ['name', 'formatted_address', 'geometry']
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        resolve([]);
      }
    });
  });
}
