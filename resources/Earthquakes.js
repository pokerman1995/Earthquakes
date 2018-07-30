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
		userInputController.addEventListener("sunburstMouseleave", onSunburstMouseleave);
    userInputController.addEventListener("sunburstMouseover", onSunburstMouseover);
    userInputController.addEventListener("mapPointermove", onTooltipRequested);
    userInputController.addEventListener("mapClick", onTooltipRequested);
    userInputController.addEventListener("timelineTickClicked", onTimelineTickClicked);
    timelineChart = new Earthquakes.TimelineChart();
    sunburstChart = new Earthquakes.SunburstChart();
    ageDistributionChart = new Earthquakes.AgeDistributionChart();
		sunburstChart.addEventListener("sunburstDrawn", onSunburstDrawn);
		sunburstChart.addEventListener("mouseleaveEnd", onSunburstMouseleaveEnd);
    

		map = new Earthquakes.Map();
		map.addEventListener("earthquakeFeatureAdded", onEarthquakeFeatureAdded);
		map.addEventListener("mapPostcompose", onMapPostcompose);
		
		map.drawMap();
		


    timelineChart.addEventListener("timelineDrawn", onTimelineDrawn);
    timelineChart.drawChart();
		    earthquakeDataProcessor = new Earthquakes.EarthquakeDataProcessor();
    earthquakeDataProcessor.addEventListener("dataParsed", onCsvDataParsed);
    earthquakeDataProcessor.addEventListener("yearsFiltered", onYearsFiltered);
    earthquakeDataProcessor.buildHierarchyFromCsv();
		


    
  }
  
  function onCsvDataParsed(jsonRoot){
    sunburstChart.drawSunburstChart(jsonRoot.data);
    sunburstChart.drawLegend();
  }
	
  function onSunburstDrawn(){
    userInputController.registerMouseLeaveOnSunburstChart();
    userInputController.registerMouseOverOnSunburstChart();
  }
  
  function onTimelineDrawn(){
    userInputController.registerListenerOnTimeline();
  }
	
  function onSunburstMouseover(d){
    sunburstChart.mouseover(d.data, map.getRegionLayer());
    ageDistributionChart.updatePieChart(d.data);
  }
	
  function onSunburstMouseleave(d){
    sunburstChart.mouseleave(d.data);
  }
  
   function onSunburstMouseleaveEnd(){
    userInputController.registerMouseOverOnSunburstChart();
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
  
  function onYearsFiltered(filteredEarthquakes){
    timelineChart.drawEarthquakeLines(filteredEarthquakes.data.filteredEarthquakes);
    map.animateEarthquakes(filteredEarthquakes.data);
    
  }
  
  function onTimelineTickClicked(year){
    earthquakeDataProcessor.filterYears(year.data);
  }
	
	
  that.init = init;
  return that;
}());
