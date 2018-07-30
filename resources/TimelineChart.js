/* eslint-env browser */
/* global EventPublisher */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.TimelineChart = function() {
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
    color = d3.scaleOrdinal(d3.schemeCategory10);

  function drawChart() {
    // Scales and axes. Note the inverted domain for the y-scale: bigger is up!
    var x = d3.scaleLinear().range([0, width, ]),
      y = d3.scaleLinear().range([height, 0, ]),
      xAxis = d3.axisBottom(x).ticks(30).tickFormat(d3.format("")),
      yAxis = d3.axisLeft(y).tickArguments(4),

      // A line generator, for the dark stroke.
      line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) {
          return x(d.year);
        })
        .y(function(d) {
          return y(d.n);
        });

    x.domain([1988, 2018, ]);
    y.domain([0, 200, ]);

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
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + width - 5 + ",0)")
      .call(yAxis);

    d3.selectAll(".x.axis .tick")
      .on("click", function(d) {
        that.notifyAll("tickClicked", d);
      })
      .on("mouseover", function() {
        d3.select(this).style("cursor", "pointer");
      });

    // Add the y-axis.

  }

  function drawEarthquakeLines(filteredEarthquakes) {
    var t,
      legend,
      keys;
    if (filteredEarthquakes.length !== 0) {
      svg.selectAll(".line")
        .data(filteredEarthquakes)
        .enter()
        .append("path")
        .attr("class", "line")
        .style("stroke", function(d, i) {
          return color(i);
        })
        .attr("clip-path", "url(#clip)")
        .attr("d", function(d) {
          return line(d);
        });

      /* Add 'curtain' rectangle to hide entire graph */
      svg.append("rect")
        .attr("x", -1 * width - 1)
        .attr("y", -1 * height)
        .attr("height", height)
        .attr("width", width - 1)
        .attr("class", "curtain")
        .attr("transform", "rotate(180)")
        .style("fill", "#4A74A8");

      /* Create a shared transition for anything we're animating */
      t = svg.transition()
        .delay(250)
        .duration(4000)
        .ease(d3.easeLinear)
        .on("end", function() {
          d3.select("line.guide")
            .transition()
            .style("opacity", 0)
            .remove();
        });

      t.select("rect.curtain")
        .attr("width", 0);
      t.select("line.guide")
        .attr("transform", "translate(" + width + ", 0)");

      legend = d3.select("#timeline").append("div")
        .attr("class", "legend")
        .style("margin-top", "30px");

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
        .style("background-color", (d, i) => color(i));

      keys.append("div")
        .attr("class", "name")
        .text(d => `${d[0].name}`);

      keys.exit().remove();
    }
  }

  that.drawEarthquakeLines = drawEarthquakeLines;
  that.drawChart = drawChart;
  return that;
};