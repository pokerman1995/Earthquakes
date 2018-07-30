/* eslint-env browser */
/* global EventPublisher */

/*
 * UserInputController
 *
 * This module is responsible for managing the users interaction with the application.
 * The module catches all user events and passes these events on to the Earthquakes module.
 */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.UserInputController = function () {
  "use strict";

  var that = new EventPublisher();

  // Register listener for the mouseover event of the sunburst chart.
  function registerMouseOverOnSunburstChart() {
    d3.select("#sunburstChart").selectAll("path").on("mouseover", onMouseover);
  }

  // Register listener for the mouseleave event of the sunburst chart.
  function registerMouseLeaveOnSunburstChart() {
    d3.select("#sunburstChart").on("mouseleave", onMouseleave);
  }

  /* Register listener for the timeline-tick click event of the timeline chart.
   * Also register event for mouse cursor change on mouseover event. */
  function registerListenerOnTimeline() {
    d3.selectAll(".x.axis .tick")
      .on("click", onTimelineTickClick)
      .on("mouseover", function () {
        d3.select("#timeline").selectAll(".x.axis .tick").style("cursor", "pointer");
      });
  }

  // Register listeners for the pointermove and click event of the map.
  function registerListenerOnMap(map) {
    map.on("pointermove", function (evt) {
      that.notifyAll("mapPointermove", evt);
    });
    map.on("click", function (evt) {
      that.notifyAll("mapClick", evt);
    });
  }

  /* This function is called when the user clicks on a timeline-tick
   * The function then notifies all listeners for this event. */
  function onTimelineTickClick(year) {
    that.notifyAll("timelineTickClicked", year);
  }

  /* This function is called when the users mouse pointer is over the sunburst chart.
   * The function then notifies all listeners for this event. */
  function onMouseover(d) {
    that.notifyAll("sunburstMouseover", d);
  }

  /* This function is called when the users mouse pointer leaves the sunburst chart.
   * The function then notifies all listeners for this event. */
  function onMouseleave() {
    that.notifyAll("sunburstMouseleave", null);
  }

  that.registerListenerOnTimeline = registerListenerOnTimeline;
  that.registerListenerOnMap = registerListenerOnMap;
  that.registerMouseOverOnSunburstChart = registerMouseOverOnSunburstChart;
  that.registerMouseLeaveOnSunburstChart = registerMouseLeaveOnSunburstChart;
  return that;
};
