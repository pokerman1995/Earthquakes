/* eslint-env browser */
/* global EventPublisher */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {},
  ol = ol || {};

Earthquakes.Map = function() {
  "use strict";

  var that = new EventPublisher(),
    vector,
    regions,
    map,
    raster,
			info,
          duration = 3000;

  function drawMap() {

    vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: "data/earthquakes.kml",
        format: new ol.format.KML({
          extractStyles: false,
        }),
      }),
    });

    raster = new ol.layer.Tile({
      source: new ol.source.OSM(),
    });

    regions = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: "data/us_regions.kml",
        format: new ol.format.KML(),
        visibility: true,
        opacity: 1,
      }),
    });

    map = new ol.Map({
      layers: [raster, regions, vector, ],
      target: "map",
      view: new ol.View({
        center: ol.proj.fromLonLat([-97, 38, ]),
        zoom: 3.0,
      }),
    });

    map.getView().setMinZoom(3.0);

    regions.getSource().on("addfeature", function(event) {
      event.feature.setStyle(getRegionsStyle());

    });

    vector.getSource().on("addfeature", function(event) {
      // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
      // standards-violating <magnitude> tag in each Placemark.  We extract it from
      // the Placemark's name instead.
      var position = event.feature.getGeometry().getCoordinates(),
        region;
      event.feature.setStyle(new ol.style.Style({}));

      region = regions.getSource().getFeaturesAtCoordinate(position)[0];
      that.notifyAll("earthquakeFeatureAdded", {
        "feature": event.feature,
        "region": region,
      });
    });
		
		map.on("postcompose", function(event){
			that.notifyAll("mapPostcompose", map);
		});
		
		info = $("#info");
    info.tooltip({
      animation: false,
      trigger: "manual",
    });

  }

  function getRegionsStyle() {

    return new ol.style.Style({
      fill: new ol.style.Fill({
        color: "rgba(254,240,217,0.5)",
      }),
      stroke: new ol.style.Stroke({
        color: "black",
        width: 0.5,
      }),
    });
  }
  
  function animateEarthquakes(filteredEarthquakesObject){
          var features = vector.getSource().getFeatures(),
              filteredEarthquakes = filteredEarthquakesObject["filteredEarthquakes"],
              selectedYear = filteredEarthquakesObject["year"],
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
  
      function getStyleEarthquakes(feature) {
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
	
	function displayFeatureInfo(pixel) {
        info.css({
          left: pixel[0] + "px",
          top: (pixel[1]) + "px",
        });
        var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        });
        if (feature) {
          info.tooltip("hide")
            .attr("data-original-title", feature.get("name"))
            .tooltip("fixTitle")
            .tooltip("show");

        //		$('#map').click(function(){
        //			$('.tooltip-inner').append(diagram);
        //			var featureName = feature.get('name');
        //			if( featureName in earthquakes_per_region){
        //				showEarthquakesPerYear(featureName);
        //			}
        //		})

        } else {
          info.tooltip("hide");
        }
      }
	
	function showToolTip(evt){
		    if (evt.dragging) {
      info.tooltip('hide');
      return;
    }
    displayFeatureInfo(map.getEventPixel(evt.originalEvent));
	}
	
	function getRegionLayer(){
		return regions.getSource().getFeatures();
	}

	that.getRegionLayer = getRegionLayer;	
	that.showToolTip = showToolTip;
  that.drawMap = drawMap;
  that.animateEarthquakes = animateEarthquakes;
  return that;
};