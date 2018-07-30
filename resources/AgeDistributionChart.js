/* eslint-env browser */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.AgeDistributionChart = function() {
  "use strict";

  var that = {};

  function drawPieChart(d) {

    var ageDistribution = d.data["ageDistribution"],
      size = d.data["size"];
    for (var i in ageDistribution) {
      var age = ageDistribution[i];
      age["percentage"] = "" + Math.round(age["number"] / size * 100) + "%";

    }
    var text = "",

      width = 200,
      height = 200,
      thickness = 40,
      duration = 750,
      padding = 10,
      opacity = .8,
      opacityHover = 1,
      otherOpacityOnHover = .8,
      tooltipMargin = 13,

      radius = Math.min(width - padding, height - padding) / 2,
      color = d3.scaleOrdinal(["#ff0000", "#1fe223", "#f7f30e", "#f70ea2", ]),

      svg = d3.select("#piechart")
        .append("svg")
        .attr("class", "pie")
        .attr("width", width)
        .attr("height", height),

      g = svg.append("g")
        .attr("class", "slices")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")"),

      arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius),

      pie = d3.pie()
        .startAngle(1.1 * Math.PI)
        .endAngle(3.1 * Math.PI)
        .value(function(d) {
          return d.number;
        })
        .sort(null),

      legend = d3.select("#piechart").append("div")
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
      .style("background-color", (d, i) => color(i));

    keys.append("div")
      .attr("class", "name")
      .text(d => `${d.age} (${d.percentage})`);

    keys.exit().remove();

    var path = g.selectAll("path")
      .data(pie(ageDistribution))
      .enter()
      .append("g")
      .append("path")
      .style("fill", (d, i) => color(i))

    //.attr('d', arc)
      .transition().delay(function(d, i) {
        return i * 150;
      }).duration(150)
      .attrTween("d", function(d) {
        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function(t) {
          d.endAngle = i(t);
          return arc(d);
        };
      })

      .style("opacity", opacity)
      .style("stroke", "white")
      .each(function(d) {
        this._current = d;
      });

  }

  function updatePieChart(d) {

    var color = d3.scaleOrdinal(["#ff0000", "#1fe223", "#f7f30e", "#f70ea2", ]),

      counter = 0,
      sliceCount = d3.select("#piechart").selectAll("path").size(),

      ageDistribution = d.data["ageDistribution"];
    if (ageDistribution === undefined) {
      if (!d3.select("#piechart").select("svg").empty()) {
        d3.select("#piechart").selectAll("path")
          .transition().delay(function(d, i) {
            return i * 150;
          })
          .duration(150)
          .on("end", function() {
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
    if (d3.select("#piechart").select("svg").empty()) {
      drawPieChart(d);
      return;
    }

    var size = d.data["size"];
    for (var i in ageDistribution) {
      var age = ageDistribution[i];
      age["percentage"] = "" + Math.round(age["number"] / size * 100) + "%";

    }

    var pie = d3.pie()
      .value(function(d) {
        return d.number;
      })(ageDistribution);
    var path = d3.select("#piechart").selectAll("path").data(pie);
    //path.attr("d", arc);
    path.transition().duration(500).attrTween("d", arcTween); // Smooth transition with arcTween
    //d3.selectAll("text").data(pie).attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; });

    d3.select("#piechart").select(".legend").remove();
    var legend = d3.select("#piechart").append("div")
        .attr("class", "legend")
        .style("margin-top", "30px"),

      color = d3.scaleOrdinal(["#ff0000", "#1fe223", "#f7f30e", "#f70ea2", ]),

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
      .style("background-color", (d, i) => color(i));

    keys.append("div")
      .attr("class", "name")
      .text(d => `${d.age} (${d.percentage})`);

    keys.exit().remove();

  }

  function arcTween(a) {

    var width = 200,
      height = 200,
      thickness = 40,
      duration = 750,
      padding = 10,
      opacity = .8,
      opacityHover = 1,
      otherOpacityOnHover = .8,
      tooltipMargin = 13,

      radius = Math.min(width - padding, height - padding) / 2,

      arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius),
      i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }

  that.drawPieChart = drawPieChart;
  that.updatePieChart = updatePieChart;
  return that;
};