/* eslint-env browser */

/*
 * AgeDistributionChart
 *
 * This module is responsible for drawing, updating and animating the pie chart 
 * showing the age distribution of answers of a question.
 */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.AgeDistributionChart = function () {
  "use strict";

  var that = {},
    width = 200,
    height = 200,
    padding = 10,
    opacity = .8,
    pie,
    arc,
    color;

  /* Draw and animate the age distribution pie chart for a given answer. */
  function drawPieChart(d) {
    let svg,
      g,
      ageDistribution = d.data["ageDistribution"],
      size = d.data["size"],
      radius = Math.min(width - padding, height - padding) / 2;

    color = d3.scaleOrdinal(["#ff0000", "#1fe223", "#f7f30e", "#f70ea2", ]);

    /* Calculate the percentage of how many survey participants of every age interval answered with the 
    given answer */
    for (let property in ageDistribution) {
      if (ageDistribution.hasOwnProperty(property)) {
        let age = ageDistribution[property];
        age["percentage"] = "" + Math.round(age["number"] / size * 100) + "%";
      }
    }

    // Create the svg element.
    svg = d3.select("#piechart")
      .append("svg")
      .attr("class", "pie")
      .attr("width", width)
      .attr("height", height);

    // Create g container.
    g = svg.append("g")
      .attr("class", "slices")
      .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    // Create the arc.
    arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    // Create the pie.
    pie = d3.pie()
      .startAngle(1.1 * Math.PI)
      .endAngle(3.1 * Math.PI)
      .value(function (d) {
        return d.number;
      })
      .sort(null);

    // Draw the legend of the pie chart.
    drawLegend(ageDistribution);

    // Draw and animate the pie slices.
    g.selectAll("path")
      .data(pie(ageDistribution))
      .enter()
      .append("g")
      .append("path")
      .style("fill", (d, i) => color(i))
      .transition().delay(function (d, i) {
        return i * 150;
      }).duration(150)
      .attrTween("d", function (d) {
        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function (t) {
          d.endAngle = i(t);
          return arc(d);
        };
      })
      .style("opacity", opacity)
      .style("stroke", "white")
      // Save the angle of every slice.
      .each(function (d) {
        this.current = d;
      });

  }

  // Draw the legend of the current pie chart.
  function drawLegend(ageDistribution) {
    let legend = d3.select("#piechart").append("div")
        .attr("class", "legend")
        .style("margin-top", "30px"),

      keys = legend.selectAll(".key")
        .data(ageDistribution)
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
      .style("background-color", function (d, i) {
        return color(i);
      });

    keys.append("div")
      .attr("class", "name")
      .text(function (d) {
        return `${d.age} (${d.percentage})`;
      });

    keys.exit().remove();
  }

  /* This function either animates the transition from the old pie chart to the new 
   * pie chart or draws the pie chart if no pie chart exists yet or removes the current pie chart. */
  function updatePieChart(d) {
    let counter = 0,
      sliceCount = d3.select("#piechart").selectAll("path").size(),
      ageDistribution = d.data["ageDistribution"],
      size = d.data["size"],
      path;

    if (ageDistribution === undefined) {
      if (!d3.select("#piechart").select("svg").empty()) {
        // If user didnt hover over an answer in the sunburst chart, remove the pie chart.
        d3.select("#piechart").selectAll("path")
          .transition().delay(function (d, i) {
            return i * 150;
          })
          .duration(150)
          .on("end", function () {
            counter++;
            if (counter === sliceCount) {
              d3.select("#piechart").select("svg").remove();
              d3.select("#piechart").select(".legend").remove();
            }
          })
          .remove();

        return;
      }
      return;

    }
    /* If the user hovered over an answer in the sunburst chart and no pie chart is existing,
     * draw the pie chart. */
    if (d3.select("#piechart").select("svg").empty()) {
      drawPieChart(d);
      return;
    }

    /* Calculate the percentage of how many survey participants of every age interval answered with the 
    given answer */
    for (let property in ageDistribution) {
      if (ageDistribution.hasOwnProperty(property)) {
        let age = ageDistribution[property];
        age["percentage"] = "" + Math.round(age["number"] / size * 100) + "%";
      }
    }

    // Animate the transition between the old pie chart and the now needed pie chart.
    pie = d3.pie()
      .value(function (d) {
        return d.number;
      })(ageDistribution);
    path = d3.select("#piechart").selectAll("path").data(pie);
    path.transition().duration(500).attrTween("d", arcTween);

    // Redraw the legend-
    d3.select("#piechart").select(".legend").remove();
    drawLegend(ageDistribution);

  }

  function removePieChart() {
    let counter = 0,
      sliceCount = d3.select("#piechart").selectAll("path").size();

    d3.select("#piechart").selectAll("path")
      .transition().delay(function (d, i) {
        return i * 150;
      })
      .duration(150)
      .on("end", function () {
        counter++;
        if (counter === sliceCount) {
          d3.select("#piechart").select("svg").remove();
          d3.select("#piechart").select(".legend").remove();
        }
      })
      .remove();
  }

  // Arc tween function for smooth transitions of the pie chart.
  function arcTween(a) {
    let i = d3.interpolate(this.current, a);
    this.current = i(0);
    return function (t) {
      return arc(i(t));
    };
  }

  that.drawPieChart = drawPieChart;
  that.updatePieChart = updatePieChart;
  that.removePieChart = removePieChart;
  return that;
};
