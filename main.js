(function() {
	var ge;
    google.load("earth", "1", {'language': 'zh_cn' , "other_params":"sensor=false"});

    function init() {
		google.earth.createInstance('map3d', initCB, failureCB);
    }

    function initCB(instance) {
      ge = instance;
      ge.getWindow().setVisibility(true);
	  ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
 
    var la = ge.createLookAt('');
    la.set(33,105.46, 0, ge.ALTITUDE_RELATIVE_TO_GROUND,
        0, 0, 8000000);   //最后一个参数是放大倍数，可根据页面大小调整.  第一、二位置是中国中心位置经纬度
    ge.getView().setAbstractView(la);

	  // var href = 'http://developers.google.com/kml/documentation/kmlfiles/bounce_example.kml';
	  // google.earth.fetchKml(ge, href, kmlFinishedLoading);
    }

	// function kmlFinishedLoading(object) {
	//    ge.getTourPlayer().setTour(object);
	//    ge.getTourPlayer().play();
	// }
	
    function failureCB(errorCode) {
    }

    google.setOnLoadCallback(init);
	
	
	/***** ip.. ****/
	
	var earthip = {};
	earthip.attData = [];
	earthip.allData = [];
	earthip.ipCoord = Array;
	earthip.IpData = function() {
		m.request({method: "GET", url: "db.json"}).then(function(data) {
			for (var key in data) {
				earthip.attData.push(key);
			}
			earthip.allData = data;
		});
		
		m.request({method: "GET", url: "ip.json"}).then(function(data) {
			earthip.ipCoord = data;
		});
	};
	earthip.overlay = function() {
		var element = document.getElementById("map3d");
		// 创建 ScreenOverlay
		var screenOverlay = ge.createScreenOverlay('');
		// 指定图片路径，并设置图标
		var icon = ge.createIcon('');
		icon.setHref('http://www.google.com/intl/en_ALL/images/logo.gif');
		screenOverlay.setIcon(icon);
		// 设置ScreenOverlay在窗口中的位置
		screenOverlay.getOverlayXY().setXUnits(ge.UNITS_PIXELS);
		screenOverlay.getOverlayXY().setYUnits(ge.UNITS_PIXELS);
		screenOverlay.getOverlayXY().setX(element.clientWidth / 2);
		screenOverlay.getOverlayXY().setY(element.clientHeight / 2);
		// 设置叠加层的尺寸（以像素为单位）
		screenOverlay.getSize().setXUnits(ge.UNITS_PIXELS);
		screenOverlay.getSize().setYUnits(ge.UNITS_PIXELS);
		screenOverlay.getSize().setX(element.clientWidth);
		screenOverlay.getSize().setY(element.clientHeight);
		// 向Google地球添加 ScreenOverlay
		ge.getFeatures().appendChild(screenOverlay);
	};
	earthip.getIpCoord = function(ipStr) {
		return earthip.ipCoord[ipStr];
	};
	earthip.removeAll = function() {
		var features = ge.getFeatures().getChildNodes();
		for (var i = 0; i < features.getLength(); i ++) {
			ge.getFeatures().removeChild(features.item(i));
		}
	};
	earthip.addPoint = function(coord, name, type) {
		// 创建地标。
		var placemark = ge.createPlacemark('');
		placemark.setName(name);
		if (type) {
			var icon = ge.createIcon('');
			icon.setHref('http://maps.google.com/mapfiles/kml/paddle/red-circle.png');
			var style = ge.createStyle(''); //create a new style
			style.getIconStyle().setIcon(icon); //将图标应用到样式
			placemark.setStyleSelector(style); //将样式应用到地标
		}
		// 设置地标的位置。
		var point = ge.createPoint('');
		point.setLatitude(parseFloat(coord["lat"]));
		point.setLongitude(parseFloat(coord["long"]));
		placemark.setGeometry(point);
		// 向 Google 地球添加地标。
		ge.getFeatures().appendChild(placemark);
	}
	earthip.showGroupIp = function(selectedIp) {
		var attCoord = earthip.getIpCoord(selectedIp);
		var ips = earthip.allData[selectedIp];
		
		earthip.addPoint(attCoord, attCoord["address"] + "(ip.exe)", 1);
		
		var multiGeometry = ge.createMultiGeometry('');
		for (var idx = 0; idx < ips.length; idx ++) {
			var ipCoord = earthip.getIpCoord(ips[idx]);
			
	    	var line = ge.createLineString('');
			line.getCoordinates().pushLatLngAlt(parseFloat(ipCoord["lat"]), parseFloat(ipCoord["long"]), 0);
			line.getCoordinates().pushLatLngAlt(parseFloat(attCoord["lat"]), parseFloat(attCoord["long"]), 0);
			line.setTessellate(true);
			line.setAltitudeMode(ge.ALTITUDE_CLAMP_TO_GROUND);
			multiGeometry.getGeometries().appendChild(line);
			
			//添加点
			earthip.addPoint(ipCoord, ipCoord["address"] + "(被窃文件10个)");
		}
		
		var multGeoPlacemark = ge.createPlacemark('');
		multGeoPlacemark.setGeometry(multiGeometry);
		
		multGeoPlacemark.setStyleSelector(ge.createStyle(''));
		var lineStyle = multGeoPlacemark.getStyleSelector().getLineStyle();
		lineStyle.setWidth(10);
		lineStyle.getColor().set('ffff0000');
		
		ge.getFeatures().appendChild(multGeoPlacemark);


        ge.getOptions().setFlyToSpeed(0.5);
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
        lookAt.setTilt(35.0);
		lookAt.setLatitude(parseFloat(attCoord["lat"]);
		lookAt.setLongitude(parseFloat(attCoord["long"]);
		lookAt.setRange(50000.0);
		ge.getView().setAbstractView(lookAt);
	};
	earthip.showSingleIp = function(selectedIp) {
		var attCoord = earthip.getIpCoord(selectedIp);
		
		earthip.addPoint(attCoord, attCoord["address"] + "(10)");
		
		//   	    var la = ge.createLookAt('');
		// la.set(attCoord[0], attCoord[1], 0, ge.ALTITUDE_RELATIVE_TO_GROUND, -8.541, 66.213, 8000);
        ge.getOptions().setFlyToSpeed(0.5);
 
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
        lookAt.setTilt(35.0);
		// 设置新的纬度值和经度值。
		lookAt.setLatitude(parseFloat(attCoord["lat"]));
		lookAt.setLongitude(parseFloat(attCoord["long"]));
		lookAt.setRange(50000.0);
		// 更新 Google 地球中的视图。
		ge.getView().setAbstractView(lookAt);
	};
	earthip.controller = function() {
		this.selectedIp = m.prop("122.124.137.19");
		this.selectedSubIp = m.prop("");
		
		earthip.IpData();

		this.selected = function(index) {
			var ip = index.target.innerText.toString();
			this.selectedIp(ip);
			this.selectedSubIp("");
			m.redraw(true);
			
			earthip.removeAll();
			earthip.showGroupIp(ip);
		}.bind(this);
		this.attipSelected = function(index) {
			var ip = index.target.innerText.toString();
			this.selectedSubIp(ip);
			m.redraw(true);
			
			earthip.removeAll();
			earthip.showSingleIp(ip);
			// // 获取当前视图。
			// var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
			// // 设置新的纬度值和经度值。
			// lookAt.setLatitude(39.98881);
			// lookAt.setLongitude(116.474828);
			// lookAt.setRange(5000.0);
			// // 更新 Google 地球中的视图。
			// ge.getView().setAbstractView(lookAt);
		}.bind(this);
	};
	earthip.view = function(ctrl) {
		return [m("div.pure-u-1-2", m("ul", [m("li.head", "攻击者IP"), earthip.attData.map(function(item, iIndex) {
			if (item == ctrl.selectedIp()) {
				return m("li", m("a.highlighted[href='#']", {onclick: ctrl.selected}, item));
			} else {
				return m("li", m("a[href='#']", {onclick: ctrl.selected}, item));
			}
		})])), m("div.pure-u-1-2", m("ul", [m("li.head", "被攻击者IP"), earthip.allData[ctrl.selectedIp()].map(function(item, iIndex) {
			if (item == ctrl.selectedSubIp()) {
				return m("li", m("a.selected[href='#']", {onclick: ctrl.attipSelected}, item));
			} else {
				return m("li", m("a[href='#']", {onclick: ctrl.attipSelected}, item));
			}
		})]))];
	};

	m.module(document.getElementById("iplist"), earthip);
	
}());


