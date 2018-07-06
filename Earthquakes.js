var Earthquakes = Earthquakes || {};
var parsedData;
var earthquakes_per_region={};
var isLoaded = function(data){
  parsedData = data;
  regions.getSource().clear();
}
var parser = new EarthquakeDataProcesser();
parser.dataParser(isLoaded, 0);
//parser.dataParser(isLoaded, 1);
//parser.binaryDataParser(isLoaded, 2);
//var that = new EventPublisher();
var blur = document.getElementById('blur');
var radius = document.getElementById('radius');
var userInputController;
var findDate = /(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/gi;


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
	var earthquake = {};
	var description = event.feature.get('description');
	var year = description.match(findDate)[0].substr(0,4);
    var magnitude = parseFloat(name.substr(2));
    event.feature.set('weight', magnitude);
	var position = event.feature.getGeometry().getCoordinates();

	var feature = regions.getSource().getFeaturesAtCoordinate(position)[0];
	if(!(feature === undefined)){

		var region = feature.get('name');

		var earthquakes_per_year = [];
		if(!(region in earthquakes_per_region)){
			for(var i = 0; i <= 30; i++){
				var obj = {};
				var yearOld = 1988 + i;
				obj.year = yearOld;
				obj.n = 0;
				earthquakes_per_year.push(obj);

			}
			earthquakes_per_region[region] = earthquakes_per_year;
		}
		earthquakes_per_year = earthquakes_per_region[region];
		for(var i = 0; i < earthquakes_per_year.length; i++){
			if(earthquakes_per_year[i].year == year){
				earthquakes_per_year[i].n = earthquakes_per_year[i].n+1;
			}
		}
	}
  });

console.log(earthquakes_per_region);

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
   var red = 255*value*1.5;
   var green = 255-red;
   var color="rgba(" + red + ", " + green + ", 0, 0.6)";

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
	  console.log(parsedData);
    for(var i  = 0; i < parsedData.length; i++){
      if( parsedData[i].key === name){
        value = parsedData[i].dataValue;
      }

    }
    event.feature.setStyle(getColor(value));

  })



Earthquakes.ChangeDataControl = function(opt_options) {

    var options = opt_options || {};
    var button1 = document.createElement('button');
    button1.setAttribute('id', 'button-change-data');
    button1.innerHTML="Fear of 'Big One'";
    var button2 = document.createElement('button');
    button2.innerHTML="Fear in general";
    button2.setAttribute('id', 'button-change-data');
    var button3 = document.createElement('button');
    button3.setAttribute('id', 'button-change-data');
    button3.innerHTML="Earthquake experienced";

    var _this = this;


    button1.addEventListener('click', changeLayoutToFearBigOne, false);
    button1.addEventListener('touchstart', changeLayoutToFearBigOne, false);

    button2.addEventListener('click', changeLayoutToFearGeneral, false);
    button2.addEventListener('touchstart', changeLayoutToFearGeneral, false);

    button3.addEventListener('click', changeLayoutToWitnessedEarthquakes, false);
    button3.addEventListener('touchstart', changeLayoutToWitnessedEarthquakes, false);

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

var diagram = document.createElement('svg');

  var displayFeatureInfo = function(pixel) {
    info.css({
      left: pixel[0] + 'px',
      top: (pixel[1] + 160) + 'px'
    });
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
      return feature;
    });
    if (feature) {
      info.tooltip('hide')
          .attr('data-original-title', feature.get('name'))
          .tooltip('fixTitle')
          .tooltip('show');
		
		$('#map').click(function(){
			$('.tooltip-inner').append(diagram);
			var featureName = feature.get('name');
			if( featureName in earthquakes_per_region){
				showEarthquakesPerYear(featureName);
			}
		})

		
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

  function changeLayoutToFearBigOne() {
    parser.dataParser(isLoaded, 0);
  }



  function changeLayoutToFearGeneral() {
	  parser.dataParser(isLoaded, 1);
    // Custom Event erzeugen->triggered, wenn daten geladen

  }

  function changeLayoutToWitnessedEarthquakes() {
	  parser.binaryDataParser(isLoaded, 2);

  }

var showEarthquakesPerYear = function(region){
	var earthquakes_per_year = earthquakes_per_region[region];
    var margin = 20,
        width = 300, 
		barHeight = 20;
	
	var svg = d3.select("svg").attr("width", width).attr("height", barHeight*earthquakes_per_year.length);



    var xScale = d3.scaleLinear().domain([1988, 2018]).range([0, width]);
        //yScale = d3.scaleLinear().range([height, 0]);


	var bar = svg.selectAll("g")
		.data(earthquakes_per_year)
	  .enter().append("g")
		.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

	bar.append("rect")
		.attr("width", 100)
		.attr("height", function(d){return d.n;});
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
