/* eslint-env browser */

var Earthquakes = Earthquakes || {};
Earthquakes = (function(){
  "use strict";
	
  var that = {},
			userInputController,
			map,
    timelineChart,
    ageDistributionChart,
    sunburstChart,
    earthquakeDataProcessor;
    
  function init() {
    userInputController = new Earthquakes.UserInputController();
		console.log(userInputController);
		userInputController.addEventListener("sunburstMouseleave", onSunburstMouseleave);
    userInputController.addEventListener("sunburstMouseover", onSunburstMouseover);
    userInputController.addEventListener("mapPointermove", onTooltipRequested);
    userInputController.addEventListener("mapClick", onTooltipRequested);
    timelineChart = new Earthquakes.TimelineChart();
    sunburstChart = new Earthquakes.SunburstChart();
		sunburstChart.addEventListener("sunburstDrawn", onSunburstDrawn);

		map = new Earthquakes.Map();
		map.addEventListener("earthquakeFeatureAdded", onEarthquakeFeatureAdded);
		map.addEventListener("mapPostcompose", onMapPostcompose);
		
		map.drawMap();
		


    timelineChart.addEventListener("tickClicked", showFilteredYears);
    timelineChart.drawChart();
    drawLegend();
		    earthquakeDataProcessor = new Earthquakes.EarthquakeDataProcessor();
    earthquakeDataProcessor.addEventListener("dataParsed", onCsvDataParsed);
    earthquakeDataProcessor.buildHierarchyFromCsv();
		

    var parsedData,
      earthquakes = [],
      filteredEarthquakes = [],
      isLoaded = function(data) {
        parsedData = data;
        regions.getSource().clear();
      };
      //parser.dataParser(isLoaded, 0);
      //parser.dataParser(isLoaded, 1);
      //parser.binaryDataParser(isLoaded, 2);

      //parser.parseJson();
      //var that = new EventPublisher();
      //var blur = document.getElementById('blur');
      //var radius = document.getElementById('radius');


 /*   Earthquakes.ChangeDataControl = function(opt_options) {

      var options = opt_options || {},
        button1 = document.createElement("button");
      button1.setAttribute("id", "button-change-data");
      button1.innerHTML = "Fear of 'Big One'";
      var button2 = document.createElement("button");
      button2.innerHTML = "Fear in general";
      button2.setAttribute("id", "button-change-data");
      var button3 = document.createElement("button");
      button3.setAttribute("id", "button-change-data");
      button3.innerHTML = "Earthquake experienced";

      var _this = this;

      button1.addEventListener("click", changeLayoutToFearBigOne, false);
      button1.addEventListener("touchstart", changeLayoutToFearBigOne, false);

      button2.addEventListener("click", changeLayoutToFearGeneral, false);
      button2.addEventListener("touchstart", changeLayoutToFearGeneral, false);

      button3.addEventListener("click", changeLayoutToWitnessedEarthquakes, false);
      button3.addEventListener("touchstart", changeLayoutToWitnessedEarthquakes, false);

      var element = document.createElement("div");
      element.className = "change-data ol-unselectable ol-control";
      element.appendChild(button1);
      element.appendChild(button2);
      element.appendChild(button3);

      ol.control.Control.call(this, {
        element: element,
        target: options.target,
      });
    };
    ol.inherits(Earthquakes.ChangeDataControl, ol.control.Control);
		*/



    //  blur.addEventListener('input', function() {
    //    vector.setBlur(parseInt(blur.value, 10));
    //  });

    //  radius.addEventListener('input', function() {
    //    vector.setRadius(parseInt(radius.value, 10));
    //  });

/*
    var diagram = document.createElement("svg");





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

    var showEarthquakesPerYear = function(region) {

        var earthquakes_per_year = earthquakes_per_region[region],
          margin = {
            top: 10,
            right: 10,
            bottom: 40,
            left: 30,
          },
          width = 480 - margin.left - margin.right,
          height = 250,

          svg = d3.select("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

          xScale = d3.scaleBand().range([0, width, ]),
          yScale = d3.scaleLinear().range([height, 0, ]),

          xAxis = d3.axisBottom(xScale),
          yAxis = d3.axisLeft(yScale).ticks(20);

        xScale.domain(earthquakes_per_year.map(function(d) {
          return d.year;
        }))
          .paddingInner(0.1)
          .paddingOuter(0.5);
        yScale.domain([0, d3.max(earthquakes_per_year, function(d) {
          return d.n;
        }), ]);

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
          .attr("x", function(d) {
            return xScale(d.year);
          })
          .attr("width", xScale.bandwidth())
          .attr("y", function(d) {
            return yScale(d.n);
          })
          .attr("height", function(d) {
            return height - yScale(d.n);
          });

      },

      container = document.getElementById("popup"),
      popup = new ol.Overlay({
        element: container,
      });
    map.addOverlay(popup);

    function init1() {
      userInputController = new Earthquakes.UserInputController;
      userInputController.addEventListener("changeLayoutToGeneralFear", changeLayoutToGeneral);
      userInputController.addEventListener("changeLayoutToWitnessedEarthquakes", changeLayoutToWitnessed);
      userInputController.addEventListener("changeLayoutToFatalFear", changeLayoutToFatal);
    }



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
		}*/

    //});
		
		

    function showFilteredYears(selectedYear) {

      filteredEarthquakes = [];
      console.log(earthquakes);
      earthquakes.forEach(function(d) {
        filteredEarthquakes.push(d.filter(function(object) {
          var year = object.year;
          return year <= selectedYear;
        }));
      });
      d3.select("#timeline").select("svg").remove();
      d3.select("#timeline").select(".legend").remove();
      drawTimeline();

      var features = vector.getSource().getFeatures(),
        filteredFeatures = features.filter(function(d) {
          d.setStyle(new ol.style.Style({}));
          return d.get("year") == selectedYear;
        });
      filteredFeatures.forEach(function(d) {
        setTimeout(function() {
          d.setStyle(getStyleEarthquakes(d));
          flash(d);
        }, 500);

      });

    }

    var getStyleEarthquakes = function(feature) {
      return new ol.style.Style({
        image: new ol.style.Circle({
          radius: calculateRadius(feature.get("weight")),
          fill: new ol.style.Fill({
            color: "#4A74A8",
          }),
          stroke: new ol.style.Stroke({
            color: "#000000",
            width: 1,
          }),

        }),

      });
    };

    function calculateRadius(weight) {
      if (weight < 4.5) {
        return 5;
      } else if (weight < 5) {
        return 8;
      } else if (weight < 5.5) {
        return 10;
      }
      return 12;

    }

    var duration = 3000;

    function flash(feature) {
      var start = new Date().getTime(),
        listenerKey = map.on("postcompose", animate);

      function animate(event) {
        var vectorContext = event.vectorContext,
          frameState = event.frameState,
          flashGeom = feature.getGeometry().clone(),
          elapsed = frameState.time - start,
          elapsedRatio = elapsed / duration,
          // radius will be 5 at start and 30 at end.
          radius = ol.easing.easeOut(elapsedRatio) * 25 + 5,
          opacity = ol.easing.easeOut(1 - elapsedRatio),

          style = new ol.style.Style({
            image: new ol.style.Circle({
              radius: radius,
              snapToPixel: false,
              stroke: new ol.style.Stroke({
                color: "#4A74A8",
                width: 0.25 + opacity,
              }),
            }),
          });

        vectorContext.setStyle(style);
        vectorContext.drawGeometry(flashGeom);
        if (elapsed > duration) {
          ol.Observable.unByKey(listenerKey);
          return;
        }
        // tell OpenLayers to continue postcompose animation
        map.render();
      }
    }

    function drawLegend() {

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
      var li = {
          w: 550,
          h: 25,
          s: 3,
          r: 3,
        },

        questions = {
          "In general, how worried are you about earthquakes?": "#A3BFE1",
          "How worried are you about the Big One, a massive, catastrophic earthquake?": "#315F96",
          "Do you think the \"Big One\" will occur in your lifetime?": "#8279CC",
          "Have you ever experienced an earthquake?": "#428A9E",
          "Have you or anyone in your household taken any precautions for an earthquake?": "#2D5965",
          "How familiar are you with the San Andreas Fault line?": "#B2B8D3",
          "How familiar are you with the Yellowstone Supervolcano?": "#4CBF6F",
        },

        questionColors = {};
      for (var i = 0; i < 7; i++) {
        var question = Object.keys(questions)[i],
          color = questions[question];
        questionColors[question] = color;
      }

      var legend = d3.select("#legend").append("svg:svg")
          .attr("width", li.w)
          .attr("height", d3.keys(questionColors).length * (li.h + li.s)),

        g = legend.selectAll("g")
          .data(d3.entries(questionColors))
          .enter().append("svg:g")
          .attr("transform", function(d, i) {
            return "translate(0," + i * (li.h + li.s) + ")";
          });

      g.append("svg:rect")
        .attr("rx", li.r)
        .attr("ry", li.r)
        .attr("width", li.w)
        .attr("height", li.h)
        .style("fill", function(d) {
          return d.value;
        });

      g.append("svg:text")
        .attr("x", li.w / 2)
        .attr("y", li.h / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .text(function(d) {
          return d.key;
        });
    }

    function drawPieChart(d) {

      var ageDistribution = d.data["ageDistribution"],
        size = d.data["size"];
      for (var i in ageDistribution) {
        var age = ageDistribution[i];
        age["percentage"] = "" + Math.round(age["number"] / size * 100) + "%";

      }
      var text = "",

        width = 200,
        height = 200,
        thickness = 40,
        duration = 750,
        padding = 10,
        opacity = .8,
        opacityHover = 1,
        otherOpacityOnHover = .8,
        tooltipMargin = 13,

        radius = Math.min(width - padding, height - padding) / 2,
        color = d3.scaleOrdinal(["#ff0000", "#1fe223", "#f7f30e", "#f70ea2", ]),

        svg = d3.select("#piechart")
          .append("svg")
          .attr("class", "pie")
          .attr("width", width)
          .attr("height", height),

        g = svg.append("g")
          .attr("class", "slices")
          .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")"),

        arc = d3.arc()
          .innerRadius(0)
          .outerRadius(radius),

        pie = d3.pie()
          .startAngle(1.1 * Math.PI)
          .endAngle(3.1 * Math.PI)
          .value(function(d) {
            return d.number;
          })
          .sort(null),

        legend = d3.select("#piechart").append("div")
          .attr("class", "legend")
          .style("margin-top", "30px"),

        keys = legend.selectAll(".key")
          .data(ageDistribution)
          .enter().append("div")
          .attr("class", "key")
          .style("display", "flex")
          .style("align-items", "center")
          .style("margin-right", "20px");

      keys.append("div")
        .attr("class", "symbol")
        .style("height", "10px")
        .style("width", "10px")
        .style("margin", "5px 5px")
        .style("background-color", (d, i) => color(i));

      keys.append("div")
        .attr("class", "name")
        .text(d => `${d.age} (${d.percentage})`);

      keys.exit().remove();

      var path = g.selectAll("path")
        .data(pie(ageDistribution))
        .enter()
        .append("g")
        .append("path")
        .style("fill", (d, i) => color(i))

      //.attr('d', arc)
        .transition().delay(function(d, i) {
          return i * 150;
        }).duration(150)
        .attrTween("d", function(d) {
          var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
          return function(t) {
            d.endAngle = i(t);
            return arc(d);
          };
        })

        .style("opacity", opacity)
        .style("stroke", "white")
        .each(function(d) {
          this._current = d;
        });

    }

    function updatePieChart(d) {

      var color = d3.scaleOrdinal(["#ff0000", "#1fe223", "#f7f30e", "#f70ea2", ]),

        counter = 0,
        sliceCount = d3.select("#piechart").selectAll("path").size(),

        ageDistribution = d.data["ageDistribution"];
      if (ageDistribution === undefined) {
        if (!d3.select("#piechart").select("svg").empty()) {
          d3.select("#piechart").selectAll("path")
            .transition().delay(function(d, i) {
              return i * 150;
            })
            .duration(150)
            .on("end", function() {
              counter++;
              if (counter === sliceCount) {
                d3.select("#piechart").select("svg").remove();
                d3.select("#piechart").select(".legend").remove();
              }
            })
            .remove();

          return;
        }
        return;

      }
      if (d3.select("#piechart").select("svg").empty()) {
        drawPieChart(d);
        return;
      }

      var size = d.data["size"];
      for (var i in ageDistribution) {
        var age = ageDistribution[i];
        age["percentage"] = "" + Math.round(age["number"] / size * 100) + "%";

      }

      var pie = d3.pie()
        .value(function(d) {
          return d.number;
        })(ageDistribution);
      path = d3.select("#piechart").selectAll("path").data(pie);
      //path.attr("d", arc);
      path.transition().duration(500).attrTween("d", arcTween); // Smooth transition with arcTween
      //d3.selectAll("text").data(pie).attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; });

      d3.select("#piechart").select(".legend").remove();
      var legend = d3.select("#piechart").append("div")
          .attr("class", "legend")
          .style("margin-top", "30px"),

        color = d3.scaleOrdinal(["#ff0000", "#1fe223", "#f7f30e", "#f70ea2", ]),

        keys = legend.selectAll(".key")
          .data(ageDistribution)
          .enter().append("div")
          .attr("class", "key")
          .style("display", "flex")
          .style("align-items", "center")
          .style("margin-right", "20px");

      keys.append("div")
        .attr("class", "symbol")
        .style("height", "10px")
        .style("width", "10px")
        .style("margin", "5px 5px")
        .style("background-color", (d, i) => color(i));

      keys.append("div")
        .attr("class", "name")
        .text(d => `${d.age} (${d.percentage})`);

      keys.exit().remove();

    }

    function arcTween(a) {

      var width = 200,
        height = 200,
        thickness = 40,
        duration = 750,
        padding = 10,
        opacity = .8,
        opacityHover = 1,
        otherOpacityOnHover = .8,
        tooltipMargin = 13,

        radius = Math.min(width - padding, height - padding) / 2,

        arc = d3.arc()
          .innerRadius(0)
          .outerRadius(radius),
        i = d3.interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arc(i(t));
      };
    }
  }
  
  function onCsvDataParsed(jsonRoot){
    sunburstChart.drawSunburstChart(jsonRoot.data);
  }
	
  function onSunburstDrawn(){
    userInputController.registerMouseListenerOnSunburstChart();
  }
	
  function onSunburstMouseover(d){
    sunburstChart.mouseover(d.data, map.getRegionFeatures());
  }
	
  function onSunburstMouseleave(d){
    sunburstChart.mouseleave(d.data);
  }
	
	function onEarthquakeFeatureAdded(featureData){
		earthquakeDataProcessor.parseEarthquakeFeature(featureData.data);
	}
	
	function onMapPostcompose(map){
		userInputController.registerListenerOnMap(map.data);
	}
	
	
	function onTooltipRequested(evt){
		map.showToolTip(evt.data);
	}
	
	
  that.init = init;
  return that;
}());
