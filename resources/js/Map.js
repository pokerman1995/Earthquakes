/* eslint-env browser */
/* global EventPublisher */

/* 
 * Map
 *
 * This module represents the map view. It is responsible for creating, animating and dyeing the components of the map.
 */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {},
  ol = ol || {},
  $ = $ || {};

Earthquakes.Map = function () {
  "use strict";

  var that = new EventPublisher(),
    vector,
    regions,
    map,
    raster,
    info;

  /* Initialize the layers of the map and draw the map. */
  function drawMap() {

    // Initialize the earthquakes layer.
    vector = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: "data/earthquakes.kml",
        format: new ol.format.KML({
          extractStyles: false,
        }),
      }),
    });

    // Initialize the base map.
    raster = new ol.layer.Tile({
      source: new ol.source.OSM(),
    });

    // Initialize the region layer.
    regions = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: "data/us_regions.kml",
        format: new ol.format.KML(),
        visibility: true,
        opacity: 1,
      }),
    });

    // Put together all components of the map.
    map = new ol.Map({
      layers: [raster, regions, vector, ],
      target: "map",
      view: new ol.View({
        center: ol.proj.fromLonLat([-97, 38, ]),
        zoom: 3.0,
      }),
    });

    // Restrict zoom level to prevent the user from zooming out too far.
    map.getView().setMinZoom(3.0);

    // Set the default style for all regions.
    regions.getSource().on("addfeature", function (event) {
      event.feature.setStyle(getRegionsStyle());

    });

    /* Remove the style from all earthquakes to make them invisible  and for every earthquake find out the region in which
     * the earthquake occured. */
    vector.getSource().on("addfeature", function (event) {
      let position = event.feature.getGeometry().getCoordinates(),
        region;
      event.feature.setStyle(new ol.style.Style({}));

      region = regions.getSource().getFeaturesAtCoordinate(position)[0];
      // Notify all listeners that a new earthquake feature was added.
      that.notifyAll("earthquakeFeatureAdded", {
        "feature": event.feature,
        "region": region,
      });
    });

    // Initialize the tooltip.
    info = $("#info");
    info.tooltip({
      animation: false,
      trigger: "manual",
    });

    // Notify all listeners that the map is completely loaded.
    map.on("postcompose", function () {
      that.notifyAll("mapPostcompose", map);
    });

  }

  // Return the default style for the regions.
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

  // Filter all existing earthquake-features according to the selected year and animate them on the map.
  function animateEarthquakes(filteredEarthquakesObject) {
    let features = vector.getSource().getFeatures(),
      selectedYear = filteredEarthquakesObject["year"],
      filteredEarthquakeFeatures = features.filter(function (d) {
        d.setStyle(new ol.style.Style({}));
        return d.get("year") === selectedYear.toString();
      });
    filteredEarthquakeFeatures.forEach(function (d) {
      setTimeout(function () {
        d.setStyle(createStyleOfEarthquakes(d));
        flash(d);
      }, 500);

    });
  }

  // Return default style of earthquake features.
  function createStyleOfEarthquakes(feature) {
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
  }

  // Calculate earthquake radius for the given magnitude.
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

  // Animate the given earthquake by creating a circle that grows around the earthquake and slowly fades away.
  function flash(feature) {
    var start = new Date().getTime(),
      listenerKey = map.on("postcompose", animate);

    function animate(event) {
      var vectorContext = event.vectorContext,
        duration = 3000,
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

  // Build and show tooltip at the given pixel.
  function displayFeatureInfo(pixel) {
    info.css({
      left: pixel[0] + "px",
      top: (pixel[1]) + "px",
    });
    let feature = map.forEachFeatureAtPixel(pixel, function (feature) {
      return feature;
    });
    if (feature) {
      info.tooltip("hide");
      // Show more detailed tooltip if user has hovered over an answer segment in the sunburst chart.
      if (feature.get("division") !== undefined) {
        info.attr("data-original-title",
          feature.get("name") + ": " + Math.round(feature.get("division") * 1000) / 10 + "% of people who answered '" +
          feature.get("currentAnswer") + "' live in this region");
      } 
      // else only show name of region.
      else {
        info.attr("data-original-title", feature.get("name"));
      }
      info.tooltip("fixTitle")
        .tooltip("show");
    } else {
      info.tooltip("hide");
    }
  }

  // Show tooltip.
  function showToolTip(evt) {
    if (evt.dragging) {
      info.tooltip("hide");
      return;
    }
    displayFeatureInfo(map.getEventPixel(evt.originalEvent));
  }

  // Dye all regions according to the number of people that answered the given question with the given answer in every region.
  function dyeRegions(d) {
    let regionData = d.data.regions,
      regionFeatures = regions.getSource().getFeatures();

    if (regionData !== undefined) {
      let numOfAnswers = d3.sum(regionData, function (d) {
        return d.number;
      });
      // For every region: calculate how many people that answered the given question with the given answer live in the current region
      // and dye the region accordingly.
      for (let i = 0; i < regionFeatures.length; i++) {
        let featureName = regionFeatures[i].get("name"),
          style,
          fill,
          currentRegion = regionData.find(obj => {
            return obj.name === featureName;
          });

        if (currentRegion === undefined) {
          currentRegion = {
            "name": featureName,
            "number": 0,
          };
        }
        regionFeatures[i].set("division", currentRegion["number"] / numOfAnswers);
        regionFeatures[i].set("currentAnswer", d.data.name);
        style = regionFeatures[i].getStyle();
        fill = getStyle(currentRegion["number"], numOfAnswers);
        style.setFill(fill);
        regionFeatures[i].setStyle(style);

      }
    }
  }

  // Get the style depending on the number of answers in the given region and the total amount of answers.
  function getStyle(numOfAnswersInRegion, numOfAnswers) {
    var division = numOfAnswersInRegion / numOfAnswers,
      color;

    if (division < 0.05) {
      color = "rgba(254,240,217,0.5)";
    } else if (division < 0.15) {
      color = "rgba(253,204,138,0.5)";

    } else if (division < 0.25) {
      color = "rgba(252,141,89,0.5)";

    } else if (division < 0.35) {
      color = "rgba(227,74,51,0.5)";

    } else {
      color = "rgba(179,0,0,0.5)";

    }

    return new ol.style.Fill({
      color: color,
    });
  }

  // Return the region features.
  function getRegionLayer() {
    return regions.getSource().getFeatures();
  }

  that.getRegionLayer = getRegionLayer;
  that.showToolTip = showToolTip;
  that.drawMap = drawMap;
  that.animateEarthquakes = animateEarthquakes;
  that.dyeRegions = dyeRegions;
  return that;
};
