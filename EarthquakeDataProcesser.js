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
        console.log(parsedData);
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
  console.log(parsedData);
  isLoaded(parsedData);
});
}
  that.binaryDataParser = binaryDataParser;
  that.dataParser = dataParser;
  return that;
}
