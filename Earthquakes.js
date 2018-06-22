var Earthquakes = Earthquakes || {};
var countriesCount;
var isLoaded = function(data){
  countriesCount = data;
  console.log(countriesCount  );
  return true;
}
var parser = new EarthquakeDataProcesser(isLoaded);

var that = new EventPublisher();
var blur = document.getElementById('blur');
var radius = document.getElementById('radius');
var userInputController;

var vector = new ol.layer.Heatmap({
    source: new ol.source.Vector({
      url: 'data/earthquakes.kml',
      format: new ol.format.KML({
        extractStyles: false
      })
    }),
    blur: parseInt(blur.value, 10),
    radius: parseInt(radius.value, 10)
  });

vector.getSource().on('addfeature', function(event) {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    var name = event.feature.get('name');

    var magnitude = parseFloat(name.substr(2));
    event.feature.set('weight', magnitude);
  });


var raster = new ol.layer.Tile({
    source: new ol.source.OSM()
  });


var regions = new ol.layer.Vector({
    source: new ol.source.Vector({
      url: 'data/us_regions.kml',
      format: new ol.format.KML(),
        visibility: true,
        opacity: 1
    })
  });

var style = new ol.style.Style({
  fill: new ol.style.Fill({
    color:'rgba(255,0,0,1)'
  })
});

var getColor = function(value){
  value = value*10
  console.log(value);
   var countryColor;
   if(value < 21){
     countryColor = 'rgba(0,0,255,0.3)';
   } if (21 < value && value < 25) {
     countryColor = 'rgba(0, 255,0, 0.3)';
   } if (value > 25) {
     countryColor = 'rgba(255, 0, 0, 0.3)';
   }
   console.log(countryColor);
   var style = new ol.style.Style({
     fill: new ol.style.Fill({
       color:countryColor
     })
   });
   return style;
}



  regions.getSource().on('addfeature', function(event) {
    var name = event.feature.get('name');
    var value;
    for(var i  = 0; i < countriesCount.length; i++){
      if( countriesCount[i].key === name){
        value = countriesCount[i].valueBigOne;
      }

    }
    event.feature.setStyle(getColor(value));

  })




  var map = new ol.Map({
    layers: [raster, regions, vector ],
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat([-97, 38]),
      zoom: 5
    })
  });






  blur.addEventListener('input', function() {
    vector.setBlur(parseInt(blur.value, 10));
  });

  radius.addEventListener('input', function() {
    vector.setRadius(parseInt(radius.value, 10));
  });
var info = $('#info');
  info.tooltip({
    animation: false,
    trigger: 'manual'
  });

  var displayFeatureInfo = function(pixel) {
    info.css({
      left: pixel[0] + 'px',
      top: (pixel[1] - 15) + 'px'
    });
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
      return feature;
    });
    if (feature) {
      info.tooltip('hide')
          .attr('data-original-title', feature.get('name'))
          .tooltip('fixTitle')
          .tooltip('show');
    } else {
      info.tooltip('hide');
    }
  };

  map.on('pointermove', function(evt) {
    if (evt.dragging) {
      info.tooltip('hide');
      return;
    }
    displayFeatureInfo(map.getEventPixel(evt.originalEvent));
  });

  function changeLayoutToGeneral() {

  }

  function changeLayoutToWitnessed() {

  }

  function changeLayoutToFatal() {

  }


  function init () {
    userInputController = new Earthquakes.userInputController;
    userInputController.addEventListener("changeLayoutToGeneralFear", changeLayoutToGeneral);
    userInputController.addEventListener("changeLayoutToWitnessedEarthquakes", changeLayoutToWitnessed);
    userInputController.addEventListener("changeLayoutToFatalFear", changeLayoutToFatal);
  }

  map.on('click', function(evt) {
    displayFeatureInfo(evt.pixel);



});
