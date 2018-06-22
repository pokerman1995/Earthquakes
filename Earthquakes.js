var Earthquakes = Earthquakes || {};
var countriesCount;
var isLoaded = function(data){
  countriesCount = data;
  return true;
}
var parser = new EarthquakeDataProcesser(isLoaded);

//var that = new EventPublisher();
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
  console.log(value);
   var red = 255*value*1.5;
   var green = 255-red;
   var color="rgba(" + red + ", " + green + ", 0, 0.5)";

   console.log(color);
   var style = new ol.style.Style({
     fill: new ol.style.Fill({
       color:color
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

Earthquakes.ChangeDataControl = function(opt_options) {

    var options = opt_options || {};
    var button1 = document.createElement('button');
    button1.className = "button-change-data";
    button1.innerHTML="Button 1";
    var button2 = document.createElement('button');
    button2.innerHTML="Button 2";
    var button3 = document.createElement('button');
    button3.innerHTML="Button 3";

    var _this = this;
    var handleDataChange = function(){
      _this.getMap().getView().setRotation(180);

    };

    button1.addEventListener('click', handleDataChange, false);
    button1.addEventListener('touchstart', handleDataChange, false);

    var element = document.createElement('div');
    element.className='change-data ol-unselectable ol-control';
    element.appendChild(button1);
    element.appendChild(button2);
    element.appendChild(button3);


    ol.control.Control.call(this, {
      element: element,
      target: options.target
    });
  };
  ol.inherits(Earthquakes.ChangeDataControl, ol.control.Control);






  var map = new ol.Map({
    controls: ol.control.defaults({
      attributionOptions: {
        collapsible: false
      }
    }).extend([
      new Earthquakes.ChangeDataControl()
    ]),
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
