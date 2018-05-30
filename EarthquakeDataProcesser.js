var d3 = d3 || {}
var Earthquakes = Earthquakes || {}

var EarthquakeDataProcesser = function(isLoaded){
  var that = {};


    var countriesCount;
    d3.csv("data/earthquake_data.csv", function(data){
        countriesCount =d3.nest()
            .key(function(d) {
                var key = d[data.columns[10]];
                if(key !== ""){
                return d[data.columns[10]];
                }})
            .rollup(function(v) { return v.length; })
            .entries(data);

        for(var i in countriesCount){
            countriesCount[i].valueBigOne=d3.sum(data, function(d){
                var value = 0;
                if(d[data.columns[10]] === countriesCount[i].key){
                    switch(d[data.columns[1]]){
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
            countriesCount[i].valueBigOne = countriesCount[i].valueBigOne/countriesCount[i].value;


        }
        for(var i in countriesCount){

          if(countriesCount[i].key ==="undefined"){
            countriesCount.splice(i, 1);
          }
        }

        isLoaded(countriesCount);


        //for(var i = 0; i < data.length; i++){
          //  console.log(data[i][data.columns[10]]);
        //}
    });

  return that;
}
