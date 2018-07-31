/* eslint-env browser */
/* global EventPublisher */

/*
 * SunburstChart
 *
 * This module is responsible for drawing the sunburst chart and its legend.
 * It also updates the chart on mouseleave and mouseover events.
 */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.SunburstChart = function () {
  "use strict";

  var that = new EventPublisher(),
    width = document.getElementById("sunburstChart").offsetWidth,
    height = width,
    radius = Math.min(width, height) / 2,
    // Mapping of questions and answers to colors.
    colors = {
      "In general, how worried are you about earthquakes?": "#A3BFE1",
      "How worried are you about the Big One, a massive, catastrophic earthquake?": "#315F96",
      "Do you think the \"Big One\" will occur in your lifetime?": "#8279CC",
      "Have you ever experienced an earthquake?": "#428A9E",
      "Have you or anyone in your household taken any precautions for an earthquake (packed an earthquake survival kit, prepared an evacuation plan, etc.)?": "#2D5965",
      "How familiar are you with the San Andreas Fault line?": "#B2B8D3",
      "How familiar are you with the Yellowstone Supervolcano?": "#4CBF6F",

      "Not at all worried": "#004D0D",
      "Not at all familiar": "#004D0D",

      "Somewhat worried": "#158999",
      "Somewhat familiar": "#158999",

      "Not so worried": "#8D2EF3",
      "Not so familiar": "#8D2EF3",

      "Very worried": "#63805d",
      "Very familiar": "#63805d",

      "Extremely worried": "#5d4d0b",
      "Extremely familiar": "#5d4d0b",

      "No": "#163aae",
      "Yes": "#FFCB57",

      "Yes, one or more minor ones": "#d5a0f8",
      "Yes, one or more major ones": "#BE5E9A",

      "No answer": "#5cfbe4",
    },
    chart;

  // Draw the sunburst chart by using the given json object.
  function drawSunburstChart(json) {
    let root,
      nodes,
      partition = d3.partition()
        .size([2 * Math.PI, radius * radius, ]),
      // Create the arc.
      arc = d3.arc()
        .startAngle(function (d) {
          return d.x0;
        })
        .endAngle(function (d) {
          return d.x1;
        })
        .innerRadius(function (d) {
          return Math.sqrt(d.y0);
        })
        .outerRadius(function (d) {
          return Math.sqrt(d.y1);
        });

    // Create the svg element and g container.
    chart = d3.select("#sunburstChart").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .append("svg:g")
      .attr("id", "container")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // Create the bounding circle for the diagram.
    chart.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

    // Turn the data into a d3 hierarchy and calculate the sums.
    root = d3.hierarchy(json)
      .sum(function (d) {
        return d.size;
      })
      .sort(function (a, b) {
        return b.value - a.value;
      });

    // For efficiency, filter nodes to keep only those large enough to see.
    nodes = partition(root).descendants()
      .filter(function (d) {
        return (d.x1 - d.x0 > 0.005);
      });

    // Fill the chart with the processed data.
    chart.data([json, ]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function (d) {
        return d.depth ? null : "none";
      })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function (d) {
        return colors[d.data.name];
      })
      .style("opacity", 1);

    // Notify the listeners that the sunburst chart is drawn.
    that.notifyAll("sunburstDrawn", null);
  }

  // Draw the legend of the sunburst chart.
  function drawLegend() {

    // Dimensions of legend item: width, height, spacing, radius of rounded rect.
    let li = {
        w: 550,
        h: 25,
        s: 3,
        r: 3,
      },
      // Mapping of questions to colors.
      questionColors = {
        "In general, how worried are you about earthquakes?": "#A3BFE1",
        "How worried are you about the Big One, a massive, catastrophic earthquake?": "#315F96",
        "Do you think the \"Big One\" will occur in your lifetime?": "#8279CC",
        "Have you ever experienced an earthquake?": "#428A9E",
        "Have you or anyone in your household taken any precautions for an earthquake?": "#2D5965",
        "How familiar are you with the San Andreas Fault line?": "#B2B8D3",
        "How familiar are you with the Yellowstone Supervolcano?": "#4CBF6F",
      },
      legend,
      g;

    // Append div for the legend.
    legend = d3.select("#legend").append("svg:svg")
      .attr("width", li.w)
      .attr("height", d3.keys(questionColors).length * (li.h + li.s));

    // Fill legend.
    g = legend.selectAll("g")
      .data(d3.entries(questionColors))
      .enter().append("svg:g")
      .attr("transform", function (d, i) {
        return "translate(0," + i * (li.h + li.s) + ")";
      });

    g.append("svg:rect")
      .attr("rx", li.r)
      .attr("ry", li.r)
      .attr("width", li.w)
      .attr("height", li.h)
      .style("fill", function (d) {
        return d.value;
      });

    g.append("svg:text")
      .attr("x", li.w / 2)
      .attr("y", li.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function (d) {
        return d.key;
      });
  }

  // Show the current question next to the sunburst chart and also the current answer if the user is hovering over
  // an answer segment of the chart. Also adjust the opacity of the charts segments.
  function showQuestionAndAnswerText(d) {

    // If the user is hovering over a question segment, show the current question on the right of the chart.
    if (d.ancestors()[1].data.name === "root") {
      d3.select("#question").text(d.data.name);
      d3.select("#question-text").style("visibility", "");
      d3.select("#answer-text").style("visibility", "hidden");
      d3.select("#ages").style("visibility", "hidden");
    }
    // else show question and answer on the right of the chart.
    else {
      let ancestors = d.ancestors(),
        totalAnswers = d3.sum(ancestors[1].data.children, function (d) {
          return d.size;
        });
      d3.select("#question").text(ancestors[1].data.name);
      d3.select("#question-text").style("visibility", "");
      d3.select("#answer").text(d.data.name);
      d3.select("#answer-text").style("visibility", "");
      d3.select("#percentage").text("" + Math.round(d.data.size / totalAnswers * 1000) / 10 + "%");
      d3.select("#ages").style("visibility", "");
    }
  }
  
  function decreaseSegmentOpacity(d){
    
    let sequenceArray = d.ancestors().reverse();

    // Fade all the segments.
    d3.select("#sunburstChart").selectAll("path")
      .style("opacity", 0.3);

    //Then highlight only those that are an ancestor of the current segment.
    chart.selectAll("path")
      .filter(function (node) {
        return (sequenceArray.indexOf(node) >= 0);
      })
      .style("opacity", 1);
  }

  // Restore everything to full opacity when moving off the visualization.
  function hideQuestionAndAnswerText() {

    // Deactivate all segments during transition.
    d3.select("#sunburstChart").selectAll("path").on("mouseover", null);

    // Transition each segment to full opacity and then reactivate it.
    d3.select("#sunburstChart").selectAll("path")
      .transition()
      .duration(500)
      .style("opacity", 1)
      .on("end", function () {
        // Notify all listeners that the mouseleave transition ended.
        that.notifyAll("mouseleaveEnd", null);
      });
  }
  
  function restoreSegmentOpacity(){
    // Hide answer and question text on the right of the chart.
    d3.select("#answer-text")
      .style("visibility", "hidden");
    d3.select("#question-text")
      .style("visibility", "hidden");
    d3.select("#ages")
      .style("visibility", "hidden");
  }

  that.showQuestionAndAnswerText = showQuestionAndAnswerText;
  that.hideQuestionAndAnswerText = hideQuestionAndAnswerText;
  that.decreaseSegmentOpacity = decreaseSegmentOpacity;
  that.restoreSegmentOpacity = restoreSegmentOpacity;
  that.drawLegend = drawLegend;
  that.drawSunburstChart = drawSunburstChart;
  return that;
};
