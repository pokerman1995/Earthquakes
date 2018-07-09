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
		
//		$('#map').click(function(){
//			$('.tooltip-inner').append(diagram);
//			var featureName = feature.get('name');
//			if( featureName in earthquakes_per_region){
//				showEarthquakesPerYear(featureName);
//			}
//		})

		
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
    var margin = {top: 10, right: 10, bottom: 40, left: 30},
        width = 480 - margin.left - margin.right,
        height = 250;
	
	    var svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
		.append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var xScale = d3.scaleBand().range([0, width]),
        yScale = d3.scaleLinear().range([height, 0]);
	
	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale).ticks(20);
	
	xScale.domain(earthquakes_per_year.map(function(d){ return d.year;}))
		      	.paddingInner(0.1)
      	.paddingOuter(0.5);
	yScale.domain([0, d3.max(earthquakes_per_year, function(d) { return d.n; })]);
	
	 svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
		  .selectAll("text")
		  .attr("transform", "rotate(90)")
		  .attr("dx", "20px")
		  .attr("dy", "-10px");


      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Frequency");

      svg.selectAll(".bar")
          .data(earthquakes_per_year)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return xScale(d.year); })
          .attr("width", xScale.bandwidth())
          .attr("y", function(d) { return yScale(d.n); })
          .attr("height", function(d) { return height - yScale(d.n); });

}

var container = document.getElementById("popup");
var popup = new ol.Overlay({
        element: container
      });
      map.addOverlay(popup);


  function init () {
    userInputController = new Earthquakes.userInputController;
    userInputController.addEventListener("changeLayoutToGeneralFear", changeLayoutToGeneral);
    userInputController.addEventListener("changeLayoutToWitnessedEarthquakes", changeLayoutToWitnessed);
    userInputController.addEventListener("changeLayoutToFatalFear", changeLayoutToFatal);
  }

  map.on('click', function(evt) {
    displayFeatureInfo(evt.pixel);
	  
	  var element = popup.getElement();
        var coordinate = evt.coordinate;

        $(element).popover('destroy');
        popup.setPosition(coordinate);
        $(element).popover({
          placement: 'top',
          animation: false,
          html: true,
			content: "<svg></svg>"
        });

        $(element).popover('show');
	    var feature = regions.getSource().getFeaturesAtCoordinate(coordinate)[0];
	  	if(feature !== undefined){
			var name = feature.get('name');
			showEarthquakesPerYear(name);
	    	document.getElementById("#popup").setAttribute("title", "Earthquakes per year");

		}else{
			$(element).popover('destroy');

		}


});
