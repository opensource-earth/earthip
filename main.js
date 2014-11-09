(function() {
	var ge;
    google.load("earth", "1", {"other_params":"sensor=false"});

    function init() {
      google.earth.createInstance('map3d', initCB, failureCB);
    }

    function initCB(instance) {
      ge = instance;
      ge.getWindow().setVisibility(true);
	  ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
    }

    function failureCB(errorCode) {
    }

    google.setOnLoadCallback(init);
	
	
	/***** ip.. ****/
	
	var earthip = {};
	earthip.attData = [];
	earthip.allData = [];
	earthip.coord = Array;
	earthip.IpData = function() {
		return m.request({method: "GET", url: "db.json"}).then(function(data) {
			for (var key in data) {
				earthip.attData.push(key);
			}
			earthip.allData = data;
		});
	};
	earthip.getIpCoord = function(ipStr) {
		var coord = new earthip.coord;
		coord[0] = Math.random() * ( 90 + 1) - 30;
		coord[1] = Math.random() * ( 180 + 1);
		
		return coord;
	};
	earthip.removeAll = function() {
		var features = ge.getFeatures().getChildNodes();
		for (var i = 0; i < features.getLength(); i ++) {
			ge.getFeatures().removeChild(features.item(i));
		}
	};
	earthip.addPoint = function(coord, name) {
		// 创建地标。
		var placemark = ge.createPlacemark('');
		placemark.setName(name);
		// 设置地标的位置。
		var point = ge.createPoint('');
		point.setLatitude(coord[0]);
		point.setLongitude(coord[1]);
		placemark.setGeometry(point);
		// 向 Google 地球添加地标。
		ge.getFeatures().appendChild(placemark);
	}
	earthip.showGroupIp = function(selectedIp) {
		var attCoord = earthip.getIpCoord(selectedIp);
		var ips = earthip.allData[selectedIp];
		
		earthip.addPoint(attCoord, selectedIp);
		
		var multiGeometry = ge.createMultiGeometry('');
		for (var idx = 0; idx < ips.length; idx ++) {
			var ipCoord = earthip.getIpCoord(ips[idx]);
			
	    	var line = ge.createLineString('');
			line.getCoordinates().pushLatLngAlt(ipCoord[0], ipCoord[1], 0);
			line.getCoordinates().pushLatLngAlt(attCoord[0], attCoord[1], 0);
			line.setTessellate(true);
			line.setAltitudeMode(ge.ALTITUDE_CLAMP_TO_GROUND);
			multiGeometry.getGeometries().appendChild(line);
			
			//添加点
			earthip.addPoint(ipCoord, ips[idx]);
		}
		
		var multGeoPlacemark = ge.createPlacemark('');
		multGeoPlacemark.setGeometry(multiGeometry);
		
		multGeoPlacemark.setStyleSelector(ge.createStyle(''));
		var lineStyle = multGeoPlacemark.getStyleSelector().getLineStyle();
		lineStyle.setWidth(10);
		lineStyle.getColor().set('ffff0000');
		
		ge.getFeatures().appendChild(multGeoPlacemark);

  	    var la = ge.createLookAt('');
		la.set(attCoord[0], attCoord[1], 0, ge.ALTITUDE_RELATIVE_TO_GROUND, -8.541, 66.213, 8000);
		ge.getView().setAbstractView(la);
	};
	earthip.showSingleIp = function(selectedIp) {
		var attCoord = earthip.getIpCoord(selectedIp);
		
		earthip.addPoint(attCoord, selectedIp);
		
		//   	    var la = ge.createLookAt('');
		// la.set(attCoord[0], attCoord[1], 0, ge.ALTITUDE_RELATIVE_TO_GROUND, -8.541, 66.213, 8000);
		
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
		// 设置新的纬度值和经度值。
		lookAt.setLatitude(attCoord[0]);
		lookAt.setLongitude(attCoord[1]);
		lookAt.setRange(50000.0);
		// 更新 Google 地球中的视图。
		ge.getView().setAbstractView(lookAt);
	};
	earthip.controller = function() {
		this.selectedIp= m.prop("122.124.137.19");
		this.attip = earthip.IpData();

		this.selected = function(index) {
			this.selectedIp(index.target.innerText);
			m.redraw(true);
			
			earthip.removeAll();
			earthip.showGroupIp(index.target.innerText);
		}.bind(this);
		this.attipSelected = function(index) {
			earthip.removeAll();
			earthip.showSingleIp(index.target.innerText);
			// // 获取当前视图。
			// var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
			// // 设置新的纬度值和经度值。
			// lookAt.setLatitude(39.98881);
			// lookAt.setLongitude(116.474828);
			// lookAt.setRange(5000.0);
			// // 更新 Google 地球中的视图。
			// ge.getView().setAbstractView(lookAt);
		}
	};
	earthip.view = function(ctrl) {
		return [m("div.pure-u-1-2", m("ul", [m("li.head", "攻击者IP"), earthip.attData.map(function(item, iIndex) {
			return m("li", m("a[href='#']", {onclick: ctrl.selected}, item));
		})])), m("div.pure-u-1-2", m("ul", [m("li.head", "被攻击者IP"), earthip.allData[ctrl.selectedIp()].map(function(item, iIndex) {
			return m("li", m("a[href='#']", {onclick: ctrl.attipSelected}, item));
		})]))];
	};

	m.module(document.getElementById("iplist"), earthip);
	
}());


