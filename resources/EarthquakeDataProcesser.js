/* eslint-env browser */
/* global EventPublisher */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.EarthquakeDataProcessor = function () {
  "use strict";
  var that = new EventPublisher(),
			      earthquakesPerRegion = {},
			earthquakeList = [];


  const COUNTRY_COLUMN = 10;

  function cleanEmptyData(parsedData) {
    for (var i in parsedData) {
      if (parsedData[i].key === "undefined") {
        parsedData.splice(i, 1);
      }
    }
    return parsedData;
  }

  var dataParser = function (isLoaded, dataColumn) {
      var parsedData;
      d3.csv("data/earthquake_data.csv", function (data) {
        console.log(data);
        parsedData = d3.nest()
          .key(function (d) {
            var key = d[data.columns[COUNTRY_COLUMN]];
            if (key !== "") {
              return d[data.columns[COUNTRY_COLUMN]];
            }
          })
          .rollup(function (v) {
            return v.length;
          })
          .entries(data);

        for (var i in parsedData) {
          parsedData[i].dataValue = d3.mean(data, function (d) {
            var value = 0;
            if (d[data.columns[COUNTRY_COLUMN]] === parsedData[i].key) {
              switch (d[data.columns[dataColumn]]) {
                case "Not at all worried":
                  value = 1;
                  break;
                case "Not so worried":
                  value = 2;
                  break;
                case "Somewhat worried":
                  value = 3;
                  break;
                case "Very worried":
                  value = 4;
                  break;
                case "Extremely worried":
                  value = 5;
                  break;
              }
            }
            return value;
          });
        }
        parsedData = cleanEmptyData(parsedData);
        isLoaded(parsedData);
      });
    },

    binaryDataParser = function (isLoaded, dataColumn) {
      var parsedData;
      d3.csv("data/earthquake_data.csv", function (data) {
        parsedData = d3.nest()
          .key(function (d) {
            var key = d[data.columns[COUNTRY_COLUMN]];
            if (key !== "") {
              return d[data.columns[COUNTRY_COLUMN]];
            }
          })
          .rollup(function (v) {
            return v.length;
          })
          .entries(data);

        for (var i in parsedData) {
          parsedData[i].dataValue = d3.mean(data, function (d) {
            var value = 0;
            if (d[data.columns[COUNTRY_COLUMN]] === parsedData[i].key) {
              switch (d[data.columns[dataColumn]]) {
                case "Yes":
                  value = 1;
                  break;
                case "No":
                  value = 2;
                  break;
              }
            }
            return value;
          });
        }
        parsedData = cleanEmptyData(parsedData);
        isLoaded(parsedData);
      });
    };

  function buildHierarchyFromCsv() {
    var root = {
      "name": "root",
      "children": [],
    };
    d3.text("data/earthquake_data.csv", function (text) {
      var csv = d3.csvParseRows(text),
        children = root["children"];
        // Header Parsen und children erzeugen.
      for (var i = 0; i < 7; i++) {
        children.push({
          "name": csv[0][i],
          "children": [],
        });
      }
      for (var i = 1; i < csv.length; i++) {
        // Only parse answers regarding earthquakes, not age etc.
        for (var j = 0; j < 7; j++) {
          var question = children[j],
            answer = csv[i][j],
            // Get region.
            region = csv[i][10],
            // Get age.
            age = csv[i][7];
          if (region === "" || region === undefined) {
            continue;
          }
          if (answer === "") {
            answer = "No answer";
          }
          var questionChildren = question["children"],
            questionChild = questionChildren.find(obj => {
              return obj.name === answer;
            });
          if (questionChild === undefined) {
            questionChild = {
              "name": answer,
              "size": 0,
              "regions": [],
              ageDistribution: [],
            };
            questionChildren.push(questionChild);
          }
          questionChild["size"] += 1;

          var answerRegions = questionChild["regions"],
            answerRegion = answerRegions.find(obj => {
              return obj.name === region;
            });
          if (answerRegion === undefined) {
            answerRegion = {
              "name": region,
              "number": 0,
            };
            answerRegions.push(answerRegion);
          }
          answerRegion["number"] += 1;

          var ageDistribution = questionChild["ageDistribution"],
            ageInterval = ageDistribution.find(obj => {
              return obj.age === age;
            });
          if (ageInterval === undefined) {
            ageInterval = {
              "age": age,
              "number": 0,
            };
            ageDistribution.push(ageInterval);
          }
          ageInterval["number"] += 1;
        }
      }
    that.notifyAll("dataParsed", root);
    });

  }
	
	function parseEarthquakeFeature(featureData){
		
		var feature = featureData["feature"],
				region = featureData["region"],
	      findDate = /(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/gi;
	
		
			var name = feature.get("name");
      var description = feature.get("description"),
        year = description.match(findDate)[0].substr(0, 4),
        magnitude = parseFloat(name.substr(2));
      feature.set("weight", magnitude);

      if (!(region === undefined)) {
        feature.set("year", year);

        var regionName = region.get("name"),
          earthquakesPerYear = [];
        if (!(regionName in earthquakesPerRegion)) {
          for (var i = 0; i <= 30; i++) {
            var obj = {},
              yearOld = 1988 + i;
            obj.year = yearOld;
            obj.n = 0;
            obj.name = regionName;
            earthquakesPerYear.push(obj);

          }
          earthquakeList.push(earthquakesPerYear);
          earthquakesPerRegion[regionName] = earthquakesPerYear;
        }
        earthquakesPerYear = earthquakesPerRegion[regionName];
        for (var i = 0; i < earthquakesPerYear.length; i++) {
          if (earthquakesPerYear[i].year == year) {
            earthquakesPerYear[i].n = earthquakesPerYear[i].n + 1;
          }
        }
      }
	}
  
      function filterYears(selectedYear) {
      var filteredEarthquakes = [];
      earthquakeList.forEach(function(d) {
        filteredEarthquakes.push(d.filter(function(object) {
          var year = object.year;
          return year <= selectedYear;
        }));
      });
        that.notifyAll("yearsFiltered", {"filteredEarthquakes" : filteredEarthquakes, "year": selectedYear});


    }
	
	function getEarthquakeList(){
		return earthquakeList;
	}
	
	function getEarthquakesPerRegion(){
		return earthquakesPerRegion;
	}

	that.getEarthquakeList = getEarthquakeList;
	that.getEarthquakesPerRegion = getEarthquakesPerRegion;
	that.parseEarthquakeFeature = parseEarthquakeFeature;
  that.buildHierarchyFromCsv = buildHierarchyFromCsv;
  that.filterYears = filterYears;
  that.binaryDataParser = binaryDataParser;
  that.dataParser = dataParser;
  return that;
};
