/* eslint-env browser */

/* Earthquakes
 * 
 * This module represents the central interface of the application.
 * The init-function is called from index.html and initializes the application.
 * This module coordinates the communication between all the other modules. 
 */
var Earthquakes = Earthquakes || {};
Earthquakes = (function () {
  "use strict";

  var that = {},
    userInputController,
    map,
    timelineChart,
    ageDistributionChart,
    sunburstChart,
    earthquakeDataProcessor;

  // Initialize the application and its modules;
  function init() {
    // Initialize the user input controller and register as listener.
    userInputController = new Earthquakes.UserInputController();
    userInputController.addEventListener("sunburstMouseleave", onSunburstMouseleave);
    userInputController.addEventListener("sunburstMouseover", onSunburstMouseover);
    userInputController.addEventListener("mapPointermove", onTooltipRequested);
    userInputController.addEventListener("mapClick", onTooltipRequested);
    userInputController.addEventListener("timelineTickClicked", onTimelineTickClicked);

    // Initialize the timeline chart, register as listener and draw the timeline chart.
    timelineChart = new Earthquakes.TimelineChart();
    timelineChart.addEventListener("timelineDrawn", onTimelineDrawn);
    timelineChart.drawChart();

    // Initialize the age distribution pie chart.
    ageDistributionChart = new Earthquakes.AgeDistributionChart();

    // Initialize the sunburst chart and register as listener.
    sunburstChart = new Earthquakes.SunburstChart();
    sunburstChart.addEventListener("sunburstDrawn", onSunburstDrawn);
    sunburstChart.addEventListener("mouseleaveEnd", onSunburstMouseleaveEnd);

    // Initialize and draw the map and register as listener.
    map = new Earthquakes.Map();
    map.addEventListener("earthquakeFeatureAdded", onEarthquakeFeatureAdded);
    map.addEventListener("mapPostcompose", onMapPostcompose);
    map.drawMap();

    // Initialize the data processor, register as listener and start parsing of the data.
    earthquakeDataProcessor = new Earthquakes.EarthquakeDataProcessor();
    earthquakeDataProcessor.addEventListener("dataParsed", onCsvDataParsed);
    earthquakeDataProcessor.addEventListener("yearsFiltered", onYearsFiltered);
    earthquakeDataProcessor.buildHierarchyFromCsv();
  }

  /* Callback that is passed on to the sunburst chart.
   * This function is called, when the csv-file containing the earthquake survey data is parsed. 
   * The parsed data is then passed on to the sunburst chart to draw the chart and the legend.
   */
  function onCsvDataParsed(jsonRoot) {
    sunburstChart.drawSunburstChart(jsonRoot.data);
    sunburstChart.drawLegend();
  }

  /* Callback that is passed on to the user input controller.
   * This function is called when the sunburst chart is drawn.
   * Then the user input controller registers its listeners on the sunburst chart.
   */
  function onSunburstDrawn() {
    userInputController.registerMouseLeaveOnSunburstChart();
    userInputController.registerMouseOverOnSunburstChart();
  }

  /* Callback that is passed on to the user input controller.
   * This function is called when the timeline chart is drawn.
   * Then the user input controller registers its listener on the timeline chart.
   */
  function onTimelineDrawn() {
    userInputController.registerListenerOnTimeline();
  }

  /* Callback that is passed on to the sunburst chart, the map and the age distribution pie chart.
   * This function is called when the user puts the mouse over the sunburst chart.
   * The data of the selected item in the sunburst diagram is then passed on to the sunburst chart to 
   * adjust the opacity, to the map to dye the regions, and to the age distribution chart to update the pie
   * chart if needed.
   */
  function onSunburstMouseover(d) {
    sunburstChart.mouseover(d.data);
    map.dyeRegions(d.data);
    ageDistributionChart.updatePieChart(d.data);
  }

  /* Callback that is passed on to the sunburst chart.
   * This function is called when the users mouse leaves the sunburst diagram.
   * The sunburst chart then restores the opacity of its segments.
   */
  function onSunburstMouseleave() {
    sunburstChart.mouseleave();
  }

  /* Callback that is passed on to the user input controller and the age distribution pie chart.
   * This function is called when the mouseleave animation of the sunburst chart ends.
   * The user input controller then again registers its listener on the sunburst chart and the 
   * age distribution pie chart is removed.
   */
  function onSunburstMouseleaveEnd() {
    userInputController.registerMouseOverOnSunburstChart();
    ageDistributionChart.removePieChart();
  }

  /* Callback that is passed on to the earthquake data processor.
   * This function is called when a new earthquake feature is added on the map.
   * The given feature is then parsed and processed by the earthquake data processor.
   */
  function onEarthquakeFeatureAdded(featureData) {
    earthquakeDataProcessor.parseEarthquakeFeature(featureData.data);
  }

  /* Callback that is passed on to the user input controller.
   * This function is called when the map finished creating its layers and adding its features.
   * The user input controller then registers its listeners on the map.
   */
  function onMapPostcompose(map) {
    userInputController.registerListenerOnMap(map.data);
  }

  /* Callback that is passed on to the map.
   * This function is called when the user hovers over or clicks on the map.
   * The map then shows a tooltip above the mouse position.
   */
  function onTooltipRequested(evt) {
    map.showToolTip(evt.data);
  }

  /* Callback that is passed on to the timeline chart and the map.
   * This function is called after the user has clicked on a year-label in the timeline chart,
   * then when the earthquakes were filtered according to the clicked year.
   * The timeline then draws the lines showing the amount of earthquakes per year until the selected year
   * and the map animates the earthquakes that occured in the selected year.
   */
  function onYearsFiltered(filteredEarthquakes) {
    timelineChart.drawEarthquakeLines(filteredEarthquakes.data.filteredEarthquakes);
    map.animateEarthquakes(filteredEarthquakes.data);

  }

  /* Callback that is passed on to the earthquake data processor.
   * This function is called when the user clicks on a year-label in the timeline chart.
   * The earthquake data processor then filters the earthquakes according to the selected year.
   */
  function onTimelineTickClicked(year) {
    earthquakeDataProcessor.filterYears(year.data);
  }

  that.init = init;
  return that;
}());
