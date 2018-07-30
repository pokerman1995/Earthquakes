/* eslint-env browser */
/* global EventPublisher */

/*
 * TimelineChart
 *
 * This module is responsible for drawing and animating the timeline graph.
 */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.TimelineChart = function () {
  "use strict";
  var that = new EventPublisher(),
    svg,
    line,
    margin = {
      top: 10,
      right: 80,
      bottom: 80,
      left: 80,
    },
    width = document.getElementById("sunburstChart").offsetWidth - margin.left - margin.top + 400,
    height = 420 - margin.right - margin.bottom,
    color = d3.scaleOrdinal(d3.schemeCategory20);

  function drawChart() {
    // Initialize the Scales and axes.
    let x = d3.scaleLinear().range([0, width, ]),
      y = d3.scaleLinear().range([height, 0, ]),
      xAxis = d3.axisBottom(x).ticks(30).tickFormat(d3.format("")),
      yAxis = d3.axisLeft(y).tickArguments(4);

    // Initialize the line generator for the stroke.
    line = d3.line()
      .curve(d3.curveMonotoneX)
      .x(function (d) {
        return x(d.year);
      })
      .y(function (d) {
        return y(d.n);
      });

    // Set the x and y domains. Cannot be calculated dynamically because then the diagram cant be drawn before the
    // data is parsed completely.
    x.domain([1988, 2018, ]);
    y.domain([0, 200, ]);

    // Create the svg element and the g container.
    svg = d3.select("#timeline").append("svg:svg")
      .attr("id", "timelineChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("class", "chart")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add the clip path.
    svg.append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);

    // Add the x-axis.
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add the y-axis.
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate( 0,0)")
      .call(yAxis);

    // Notify all listeners that the timeline is drawn.
    that.notifyAll("timelineDrawn", null);

  }

  // Draw and animate one line for every region with the given data containing earthquakes per year for every region.
  function drawEarthquakeLines(filteredEarthquakes) {
    if (filteredEarthquakes.length !== 0) {
      // Remove lines and curtain so they can be redrawn depending on the data.
      svg.selectAll(".line").remove();
      svg.selectAll(".curtain").remove();
      // Draw legend only once.
      if (d3.select("#timeline").select(".legend").empty()) {
        drawLegend(filteredEarthquakes);
      }
      // Draw all lines.
      svg.selectAll(".line")
        .data(filteredEarthquakes)
        .enter()
        .append("path")
        .attr("class", "line")
        .style("stroke", function (d, i) {
          return color(i + 4);
        })
        .attr("clip-path", "url(#clip)")
        .attr("d", function (d) {
          return line(d);
        });

      // Add 'curtain' rectangle to hide entire graph 
      svg.append("rect")
        .attr("x", -1 * width - 1)
        .attr("y", -1 * height)
        .attr("height", height)
        .attr("width", width - 1)
        .attr("class", "curtain")
        .attr("transform", "rotate(180)")
        .style("fill", "#4A74A8");

      // Create a transition for animation 
      let t = svg.transition()
        .delay(250)
        .duration(4000)
        .ease(d3.easeLinear);

      // Animate the curtain to slowly show the lines under the certain.
      t.select("rect.curtain")
        .attr("width", 0);
    }
  }

  // Draw the timeline charts legend.
  function drawLegend(filteredEarthquakes) {
    let legend = d3.select("#timeline").append("div")
      .attr("class", "legend")
      .style("margin-top", "30px"),

      keys = legend.selectAll(".key")
      .data(filteredEarthquakes)
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
      .style("background-color", (d, i) => color(i + 4));

    keys.append("div")
      .attr("class", "name")
      .text(d => `${d[0].name}`);

    keys.exit().remove();
  }

  that.drawEarthquakeLines = drawEarthquakeLines;
  that.drawChart = drawChart;
  return that;
};
