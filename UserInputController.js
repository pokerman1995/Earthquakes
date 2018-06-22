var d3 = d3 || {}
var Earthquakes = Earthquakes || {}

Earthquakes.UserInputController = function () {
	"use strict";

  var that = {},
    controls = document.querySelector(".menue");


  function onFearButtonClicked() {
    that.notifyAll("changeLayoutToGeneralFear", null);
  }

  function onWitnessButtonClicked() {
    that.notifyAll("changeLayoutToWitnessedEarthquakes", null);
  }

  function onFatalButtonClicked() {
    that.notifyAll("changeLayoutToFatalFear", null);
  }


  function init() {
    var button1 = controls.querySelector(".fear-button"),
     button2 = controls.querySelector(".witness-button"),
     button3 = controls.querySelector(".fatal-button");

    button1.addEventListener("click", onFearButtonClicked);
    button2.addEventListener("click", onWitnessButtonClicked);
    button3.addEventListener("click", onFatalButtonClicked);
  }

	
  init();

	that.changeDataControl = changeDataControl;
  that.onFearButtonClicked = onFearButtonClicked;
  that.onWitnessButtonClicked = onWitnessButtonClicked;
  that.onFatalButtonClicked = onFatalButtonClicked;
  return that;
}
