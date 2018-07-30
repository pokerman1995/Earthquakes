/* eslint-env browser */
/* global EventPublisher */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.UserInputController = function () {
  "use strict";

  var that = new EventPublisher();
	
  function registerMouseListenerOnSunburstChart(){
    d3.select("#sunburstChart").selectAll("path").on("mouseover", onMouseover);

    // Add the mouseleave handler to the bounding circle.
    d3.select("#sunburstChart").on("mouseleave", onMouseleave);
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

	that.registerListenerOnMap = registerListenerOnMap;
  that.registerMouseListenerOnSunburstChart = registerMouseListenerOnSunburstChart;
  return that;
};
