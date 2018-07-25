var Earthquakes = Earthquakes || {};
var parsedData;
var earthquakes = [];
var filteredEarthquakes = [];
var earthquakes_per_region={};
var earthquake_list = [];
var isLoaded = function(data){
  parsedData = data;
  regions.getSource().clear();
}
var parser = new EarthquakeDataProcesser();
parser.dataParser(isLoaded, 0);
parser.dataParser(isLoaded, 1);
parser.binaryDataParser(isLoaded, 2);
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
	earthquake_list.push(event.feature);

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
				obj.name = region;
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
   var color="rgba(254,240,217,0.5)";;

   var style = new ol.style.Style({
     fill: new ol.style.Fill({
       color:color
     }),
	   stroke: new ol.style.Stroke({
		   color:'black',
		   width: 0.5
	   })
   });
   return style;
}


 regions.getSource().on('addfeature', function(event) {
    var name = event.feature.get('name');
    var value;
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
    }),
	  /*.extend([
      new Earthquakes.ChangeDataControl()
    ]),*/

    layers: [raster, regions, vector],
    target: 'map',
    view: new ol.View({
      center: ol.proj.fromLonLat([-97, 38]),
      zoom: 3.4
    })
  });

map.once('postcompose', function(event){
	setTimeout(function(){
		console.log("Waiting");
		drawTimeline();
	}, 2000);
  drawLegend();
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
      top: (pixel[1]) + 'px'
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

	 /* var element = popup.getElement();
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
		}*/


});









var width = document.getElementById("chart").offsetWidth;
var height = width;
var radius = Math.min(width, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 75, h: 30, s: 3, t: 10
};

// Mapping of step names to colors.
var colors = {
  "In general, how worried are you about earthquakes?": "#5687d1",
  "How worried are you about the Big One, a massive, catastrophic earthquake?": "#7b615c",
  "Do you think the \"Big One\" will occur in your lifetime?": "#de783b",
  "Have you ever experienced an earthquake?": "#6ab975",
  "Have you or anyone in your household taken any precautions for an earthquake (packed an earthquake survival kit, prepared an evacuation plan, etc.)?": "#a173d1",
  "How familiar are you with the San Andreas Fault line?": "#bbbbbb",
  "How familiar are you with the Yellowstone Supervolcano?": "#c3da23",

  "Not at all worried": "#158d2a",
  "Not at all familiar": "#158d2a",

  "Somewhat worried": "#fa8876",
  "Somewhat familiar": "#fa8876",

  "Not so worried": "#f41dcf",
  "Not so familiar": "#f41dcf",

  "Very worried": "#63805d",
  "Very familiar": "#63805d",

  "Extremely worried": "#5d4d0b",
  "Extremely familiar": "#5d4d0b",

  "No": "#163aae",
  "Yes": "#e9a45f",

  "Yes, one or more minor ones": "#d5a0f8",
  "Yes, one or more major ones": "#b9fb6f",

  "No answer": "#5cfbe4"
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

var arc = d3.arc()
    .startAngle(function(d) { return d.x0; })
    .endAngle(function(d) { return d.x1; })
    .innerRadius(function(d) { return Math.sqrt(d.y0); })
    .outerRadius(function(d) { return Math.sqrt(d.y1); });
var json;
d3.text("data/earthquake_data.csv", function(text) {
  var csv = d3.csvParseRows(text);
  json = parser.buildHierarchy(csv);
  createVisualization(json);
});

function createVisualization(json){
  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // Turn the data into a d3 hierarchy and calculate the sums.
  var root = d3.hierarchy(json)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

	  // For efficiency, filter nodes to keep only those large enough to see.
  var nodes = partition(root).descendants()
      .filter(function(d) {
          return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
      });

  var path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return colors[d.data.name]; })
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#chart").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.datum().value;
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {

  var features = regions.getSource().getFeatures();
  var regionData = d.data.regions;


  if(regionData !== undefined){
	 var maxValue = d3.max(regionData, function(d){
	 return d.number;
		 });
	 for(var i = 0; i < features.length; i++){
		 var featureName = features[i].get('name');
		 var currentRegion = regionData.find(obj => {
			 return obj.name === featureName;
		 })
		 var style = features[i].getStyle();
		 var fill = getStyle(currentRegion["number"], maxValue);
		 style.setFill(fill);
		 features[i].setStyle(style);


	 }
	 //regions.getSource().clear();
	  //regions.getSource().addFeatures(features);
  }


  var sequenceArray = d.ancestors().reverse();
  sequenceArray.shift(); // remove root node from the array

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
}

function getStyle(value, maxValue){
	var division = value/maxValue;
	var color;
	if(division < 0.2){
	   color="rgba(254,240,217,0.5)";
	}else if (division < 0.4){
			   color="rgba(253,204,138,0.5)";

	}else if(division < 0.6){
			   color="rgba(252,141,89,0.5)";

	}else if(division < 0.8){
			   color="rgba(227,74,51,0.5)";

	}else{
			   color="rgba(179,0,0,0.5)";

	}

     return new ol.style.Fill({
       color:color
   });
}







function drawTimeline(){
	d3.select("#timelineChart").remove();
	var margin = {top: 10, right: 80, bottom: 80, left: 80},
    width = document.getElementById("chart").offsetWidth-margin.left -margin.top,
	height = 400-margin.right -margin.bottom;

	for(var region in earthquakes_per_region){
		if(earthquakes_per_region.hasOwnProperty(region)){
			var years = [];
			for(var year in earthquakes_per_region[region]){
				if(earthquakes_per_region[region].hasOwnProperty(year))
				years.push(earthquakes_per_region[region][year]);
			}
			earthquakes.push(years);
		}
	}

// Scales and axes. Note the inverted domain for the y-scale: bigger is up!
var x = d3.scaleBand().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    xAxis = d3.axisBottom(x).tickSize(1),
    yAxis = d3.axisLeft(y).tickArguments(4);

// An area generator, for the light fill.
var area = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.year); })
    .y0(height)
    .y1(function(d) { return y(d.n); });

// A line generator, for the dark stroke.
var line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.n); });

	  // Compute the minimum and maximum date, and the maximum price.
	var minYear = d3.min(earthquakes, function(d){
	  return d3.min(d, function(e){
		  return e.year;})});
	var maxYear = d3.max(earthquakes, function(d){
	  return d3.max(d, function(e){
		  return e.year;})})
  x.domain(earthquakes[0].map(function(d){return d.year}));
  y.domain([0, d3.max(earthquakes, function(d) {
	  return d3.max(d, function(e){
		  return e.n; })})]).nice();


	  var svg = d3.select("#timeline").append("svg:svg")
	  .attr("id", "timelineChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // Add the clip path.
  svg.append("clipPath")
      .attr("id", "clip")
    .append("rect")
      .attr("width", width)
      .attr("height", height);

  // Add the x-axis.
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(-25," + height + ")")
      .call(xAxis);

	var a = d3.selectAll('.x.axis .tick')
    .on('click',showFilteredYears);
	console.log(a);

  // Add the y-axis.
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width-25 + ",0)")
      .call(yAxis);

	console.log(filteredEarthquakes);
	if(filteredEarthquakes.length != 0){

	  var colors = d3.scaleOrdinal(d3.schemeCategory10);
  svg.selectAll('.line')
    .data(filteredEarthquakes)
    .enter()
      .append('path')
        .attr('class', 'line')
        .style('stroke', function(d) {
          return colors(Math.random() * 50);
        })
        .attr('clip-path', 'url(#clip)')
        .attr('d', function(d) {
          return line(d);
        })

	  /* Add 'curtain' rectangle to hide entire graph */
  var curtain = svg.append('rect')
    .attr('x', -1 * width)
    .attr('y', -1 * height)
    .attr('height', height)
    .attr('width', width)
    .attr('class', 'curtain')
    .attr('transform', 'rotate(180)')
    .style('fill', '#ffffff');


  /* Create a shared transition for anything we're animating */
  var t = svg.transition()
    .delay(250)
    .duration(4000)
    .ease(d3.easeLinear)
    .on('end', function() {
      d3.select('line.guide')
        .transition()
        .style('opacity', 0)
        .remove()
    });

  t.select('rect.curtain')
    .attr('width', 0);
  t.select('line.guide')
    .attr('transform', 'translate(' + width + ', 0)')

	}
}


  function drawLegend(){

  // Dimensions of legend item: width, height, spacing, radius of rounded rect.
  var li = {
    w: 550, h: 25, s: 3, r: 3
  };

  var questions = {
    "In general, how worried are you about earthquakes?": "#5687d1",
    "How worried are you about the Big One, a massive, catastrophic earthquake?": "#7b615c",
    "Do you think the \"Big One\" will occur in your lifetime?": "#de783b",
    "Have you ever experienced an earthquake?": "#6ab975",
    "Have you or anyone in your household taken any precautions for an earthquake?": "#a173d1",
    "How familiar are you with the San Andreas Fault line?": "#bbbbbb",
    "How familiar are you with the Yellowstone Supervolcano?": "#c3da23",
  };

  var questionColors = {};
  for (var i = 0; i < 7; i++) {
    var question = Object.keys(questions)[i];
    var color = questions[question];
    questionColors[question] = color;
  }

  var legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(questionColors).length * (li.h + li.s));

  var g = legend.selectAll("g")
      .data(d3.entries(questionColors))
      .enter().append("svg:g")
      .attr("transform", function(d, i) {
              return "translate(0," + i * (li.h + li.s) + ")";
           })

  g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function(d) { return d.value; });

  g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.key; });
}


function showFilteredYears(selectedYear){
	console.log(selectedYear);

filteredEarthquakes = [];
earthquakes.forEach(function(d){
  filteredEarthquakes.push(d.filter(function (object) {
    var year = object.year;
    return year <= selectedYear;
  }));
});

drawTimeline();



}
