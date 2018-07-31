/* eslint-env browser */
/* global EventPublisher */

/* 
 * EarthquakeDataProcessor
 *
 * This module is responsible for parsing the earthquakes survey data. It also processes
 * the earthquakes that are saved in the kml-file. Furthermore it is responsible for filtering 
 * the earthquakes if the user selects a year in the timeline chart.
 * */

var Earthquakes = Earthquakes || {},
  d3 = d3 || {};

Earthquakes.EarthquakeDataProcessor = function () {
  "use strict";
  var that = new EventPublisher(),
    earthquakesPerRegion = {},
    earthquakeList = [];

  /* Parse the earthquake-survey csv-file and convert the data into a json-object. 
   * Then return the json object, which is needed for the sunburst chart. */
  function buildHierarchyFromCsv() {
    // Create root of json.
    var root = {
      "name": "root",
      "children": [],
    };
    // Parse csv-file line after line.
    d3.text("data/earthquake_data.csv", function (text) {
      let csv = d3.csvParseRows(text),
        children = root["children"];
      // Parse Header and generate children.
      for (let i = 0; i < 7; i++) {
        children.push({
          "name": csv[0][i],
          "children": [],
        });
      }
      // Parse survey answers.
      for (let i = 1; i < csv.length; i++) {
        // Only parse answers regarding earthquakes, not age etc.
        for (let j = 0; j < 7; j++) {
          let question = children[j],
            // Current answer.
            answer = csv[i][j],
            // Current region.
            region = csv[i][10],
            // Current age.
            age = csv[i][7],
            questionChildren,
            currentQuestionChild,
            answerRegions,
            currentAnswerRegion,
            ageDistribution,
            ageInterval;

          // Skip invalid answers,
          if (region === "" || region === undefined) {
            continue;
          }
          if (answer === "") {
            answer = "No answer";
          }

          /* Create child, if current answer doesnt exist for current question.
           * else increment the counter showing how many times this answer was given. */
          questionChildren = question["children"];
          currentQuestionChild = questionChildren.find(obj => {
            return obj.name === answer;
          });
          if (currentQuestionChild === undefined) {
            currentQuestionChild = {
              "name": answer,
              "size": 0,
              "regions": [],
              ageDistribution: [],
            };
            questionChildren.push(currentQuestionChild);
          }
          currentQuestionChild["size"] += 1;

          /* Create child, if current region doesnt exist for current answer.
           * else increment the counter showing how many times this answer was given in the current region */
          answerRegions = currentQuestionChild["regions"];
          currentAnswerRegion = answerRegions.find(obj => {
            return obj.name === region;
          });
          if (currentAnswerRegion === undefined) {
            currentAnswerRegion = {
              "name": region,
              "number": 0,
            };
            answerRegions.push(currentAnswerRegion);
          }
          currentAnswerRegion["number"] += 1;

          /* Create child, if current age interval doesnt exist for current answer.
           * else increment the counter showing how many times this answer was given by people in the given age interval */
          ageDistribution = currentQuestionChild["ageDistribution"];
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
      // Notify all that the csv-file is parsed.
      that.notifyAll("dataParsed", root);
    });

  }

  /* Process the given earthquake feature.
   * A list containing all earthquakes is created and also an object holding the number of earthquakes
   * per year for every region is created. 
   * */
  function parseEarthquakeFeature(featureData) {

    var feature = featureData["feature"],
      region = featureData["region"],
      findDate = /(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/gi,
      name = feature.get("name"),
      description = feature.get("description"),
      year = description.match(findDate)[0].substr(0, 4),
      magnitude = parseFloat(name.substr(2));

    feature.set("weight", magnitude);

    if (!(region === undefined)) {
      feature.set("year", year);

      let regionName = region.get("name"),
        earthquakesPerYear = [];
      // Create new object containing the number of earthquakes per year for the current region.
      if (!(regionName in earthquakesPerRegion)) {
        for (let i = 0; i <= 30; i++) {
          let earthquakeYearObject = {},
            yearCounter = 1988 + i;
          earthquakeYearObject.year = yearCounter;
          earthquakeYearObject.n = 0;
          earthquakeYearObject.name = regionName;
          earthquakesPerYear.push(earthquakeYearObject);

        }
        earthquakeList.push(earthquakesPerYear);
        earthquakesPerRegion[regionName] = earthquakesPerYear;
      }
      /* Increment the number of earthquakes in the object that corresponds to the 
       * current earthquakes year and region. */
      earthquakesPerYear = earthquakesPerRegion[regionName];
      for (let i = 0; i < earthquakesPerYear.length; i++) {
        if (earthquakesPerYear[i].year.toString() === year) {
          earthquakesPerYear[i].n = earthquakesPerYear[i].n + 1;
        }
      }
    }
  }

  // Create list of all earthquakes that occured in the given year.
  function filterYears(selectedYear) {
    var filteredEarthquakes = [];
    earthquakeList.forEach(function (d) {
      filteredEarthquakes.push(d.filter(function (object) {
        var year = object.year;
        return year <= selectedYear;
      }));
    });
    // Notify all listeners that the earthquakes were filtered.
    that.notifyAll("yearsFiltered", {
      "filteredEarthquakes": filteredEarthquakes,
      "year": selectedYear,
    });

  }

  that.parseEarthquakeFeature = parseEarthquakeFeature;
  that.buildHierarchyFromCsv = buildHierarchyFromCsv;
  that.filterYears = filterYears;
  return that;
};
