/* eslint-env browser */
/* global EventPublisher */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.UserInputController = function () {
  "use strict";

  var that = new EventPublisher();
	
  function registerMouseOverOnSunburstChart(){
    d3.select("#sunburstChart").selectAll("path").on("mouseover", onMouseover);

  }
  
  function registerMouseLeaveOnSunburstChart(){
    
    // Add the mouseleave handler to the bounding circle.
    d3.select("#sunburstChart").on("mouseleave", onMouseleave);
  }
  
  function registerListenerOnTimeline(){
    
    d3.selectAll(".x.axis .tick")
      .on("click", onTimelineTickClick)
      .on("mouseover", function() {
        d3.select("#timeline").selectAll(".x.axis .tick").style("cursor", "pointer");
      });
  }
  
  function onTimelineTickClick(year){
    that.notifyAll("timelineTickClicked", year);
  }
	
  function onMouseover(d){
    that.notifyAll("sunburstMouseover", d);
  }
	
  function onMouseleave(d){
    that.notifyAll("sunburstMouseleave", d);
  }
	
	function registerListenerOnMap(map){
		    map.on("pointermove", function(evt) {
					that.notifyAll("mapPointermove", evt);
				});
		    map.on("click", function(evt) {
					that.notifyAll("mapClick", evt);
				});
	}

  that.registerListenerOnTimeline = registerListenerOnTimeline;
	that.registerListenerOnMap = registerListenerOnMap;
  that.registerMouseOverOnSunburstChart = registerMouseOverOnSunburstChart;
  that.registerMouseLeaveOnSunburstChart = registerMouseLeaveOnSunburstChart;
  return that;
};
