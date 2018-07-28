var d3 = d3 || {}
var Earthquakes = Earthquakes || {}

var EarthquakeDataProcesser = function(){
  var that = {};

  const COUNTRY_COLUMN = 10;

   function cleanEmptyData(parsedData) {
     for(var i in parsedData){
       if(parsedData[i].key ==="undefined"){
         parsedData.splice(i, 1);
       }
     }
     return parsedData;
   }

    var dataParser = function (isLoaded, dataColumn){
    var parsedData;
        d3.csv("data/earthquake_data.csv", function(data){
        parsedData =d3.nest()
            .key(function(d) {
                var key = d[data.columns[COUNTRY_COLUMN]];
                if(key !== ""){
                return d[data.columns[COUNTRY_COLUMN]];
                }})
            .rollup(function(v) { return v.length; })
            .entries(data);

        for(var i in parsedData){
            parsedData[i].dataValue=d3.mean(data, function(d){
                var value = 0;
                if(d[data.columns[COUNTRY_COLUMN]] === parsedData[i].key){
                    switch(d[data.columns[dataColumn]]){
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
}

var binaryDataParser = function (isLoaded, dataColumn) {
  var parsedData;
      d3.csv("data/earthquake_data.csv", function(data){
      parsedData =d3.nest()
          .key(function(d) {
              var key = d[data.columns[COUNTRY_COLUMN]];
              if(key !== ""){
              return d[data.columns[COUNTRY_COLUMN]];
              }})
          .rollup(function(v) { return v.length; })
          .entries(data);

  for(var i in parsedData){
      parsedData[i].dataValue=d3.mean(data, function(d){
          var value = 0;
          if(d[data.columns[COUNTRY_COLUMN]] === parsedData[i].key){
              switch(d[data.columns[dataColumn]]){
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
}

function buildHierarchy(csv){	
	var root = {"name": "root", "children": []};
	var children = root["children"];
	// Header Parsen und children erzeugen.
	for(var i = 0; i < 7; i++){
		children.push({"name": csv[0][i], "children": []});
	}
	for (var i = 1; i < csv.length; i++){
		// Only parse answers regarding earthquakes, not age etc.
		for(var j = 0; j < 7; j++){
			var question = children[j];
			var answer = csv[i][j];
			// Get region.
			var region = csv[i][10];
			// Get age.
			var age = csv[i][7]
			if(region === "" || region === undefined){
				continue;
			}
			if(answer === ""){
				answer = "No answer";
			}
			var questionChildren = question["children"];
			var questionChild = questionChildren.find(obj => {
				return obj.name === answer;
			})
			if(questionChild === undefined){
				questionChild = {"name": answer, "size": 0, "regions": [], ageDistribution: []};
				questionChildren.push(questionChild);
			}
			questionChild["size"] += 1;
			
			
			var answerRegions = questionChild["regions"];
			var answerRegion = answerRegions.find(obj => {
				return obj.name === region;
			});
			if(answerRegion === undefined){
				answerRegion = {"name": region, "number": 0};
				answerRegions.push(answerRegion);
			}
			answerRegion["number"] += 1;
			
			var ageDistribution = questionChild["ageDistribution"];
			var ageInterval = ageDistribution.find(obj => {
				return obj.age === age;
			});
			if(ageInterval === undefined){
				ageInterval = {"age": age, "number": 0};
				ageDistribution.push(ageInterval);
			}
			ageInterval["number"] += 1;
		}
	}
	return root;
}

  that.buildHierarchy = buildHierarchy;
  that.binaryDataParser = binaryDataParser;
  that.dataParser = dataParser;
  return that;
}
