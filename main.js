(function() {
	alert("x");
	var ge;
    google.load("earth", "1", {"other_params":"sensor=true_or_false"});

    function init() {
      google.earth.createInstance('map3d', initCB, failureCB);
    }

    function initCB(instance) {
      ge = instance;
      ge.getWindow().setVisibility(true);
    }

    function failureCB(errorCode) {
    }

    google.setOnLoadCallback(init);
}());
