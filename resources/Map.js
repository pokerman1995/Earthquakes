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
			info;

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
	
	function getRegionFeatures(){
		return regions.getSource().getFeatures();
	}

	that.getRegionFeatures = getRegionFeatures;	
	that.showToolTip = showToolTip;
  that.drawMap = drawMap;
  return that;
};