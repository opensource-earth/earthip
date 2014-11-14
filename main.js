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
 
	  locationToChina();
	
	  document.getElementById("animation").onclick = toggleRotate;
	  document.getElementById("position").onclick = locationToChina;
    }
	
    function failureCB(errorCode) {
    }

    google.setOnLoadCallback(init);
	
	
	function addPointsToLineString(lineString,lat1,lang1,lat2,lang2,steps){
		var i;
		var lat;
		var lang;
		var height;
		
		for(i = 0; i < steps; i++) {
			lat = lat1+ i*(lat2-lat1)/steps;
			lang = lang1+ i*(lang2-lang1)/steps;
			if (i==0) height = 0;
	        else if(i==1 || i==steps-1) height = 8130.76624025246;
	        else if(i==2 || i==steps-2) height = 15640.4403479026;
	  	  	else if(i==3 || i==steps-3) height = 22453.9881416349;
	  	  	else if(i==4 || i==steps-4) height =28503.3309041539;
	     	else if(i==5 || i==steps-5) height = 33728.0256022233;
	     	else if(i==6 || i==steps-6) height = 38075.8688134745;
	  	  	else if(i==7 || i==steps-7) height = 41503.4183257466;
	  	  	else if(i==8 || i==steps-8) height = 43976.4271973102;
	  	  	else if(i==9 || i==steps-9) height = 45470.1859409886;
	  	  	else if(i==10) height = 45969.769413186;
			
			lineString.getCoordinates().pushLatLngAlt(lat,lang, height);
		}
		lineString.getCoordinates().pushLatLngAlt(lat2,lang2, 0); 
	} 
	
	var speed =  12;  // degrees per second
	var lastMillis = (new Date()).getTime();
	var isRotate = false;
	function toggleRotate() {
		if (isRotate) {
			stopRotate();
		} else {
			startRotate();
		}
	}
	function startRotate() {
		if (isRotate) return;
		isRotate = true;
		
		ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
		google.earth.addEventListener(ge, "frameend", rotateEarth);   //设置事件，地图画完事件
		rotateEarth();  //第一次人工启动下。记住不加这一行，可能不旋转。
	}
	function stopRotate() {
		isRotate = false;
		google.earth.removeEventListener(ge,"frameend", rotateEarth);
		ge.getOptions().setFlyToSpeed(0.5);
	}
    function rotateEarth() {
		var now = (new Date()).getTime();
		// dt is the delta-time since last tick, in seconds
		var dt = (now - lastMillis) / 1000.0;
		lastMillis = now;
		
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
		var nextLong = lookAt.getLongitude() + speed*dt;
		if(nextLong > 180)
			nextLong = nextLong-360;
		lookAt.set(33,nextLong, 
                   0, ge.ALTITUDE_RELATIVE_TO_GROUND, 
                   0, 0, 14000000);
		ge.getView().setAbstractView(lookAt);
	}
	
	function locationToChina() {
        if (isRotate) {
            stopRotate();
        }
  	    var la = ge.createLookAt('');
  	    la.set(33,105.46, 0, ge.ALTITUDE_RELATIVE_TO_GROUND, 0, 0, 12000000); //最后一个参数是放大倍数，可根据页面大小调整.  第一、二位置是中国中心位置经纬度
  	    ge.getView().setAbstractView(la);
    }
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
		
		earthip.addPoint(attCoord, attCoord["address"] + "(窃取文件87个)", 1);
		
		var multiGeometry = ge.createMultiGeometry('');
		for (var idx = 0; idx < ips.length; idx ++) {
			var ipCoord = earthip.getIpCoord(ips[idx]);
			
			// var line = ge.createLineString('');
			// line.getCoordinates().pushLatLngAlt(parseFloat(ipCoord["lat"]), parseFloat(ipCoord["long"]), 0);
			// line.getCoordinates().pushLatLngAlt(parseFloat(attCoord["lat"]), parseFloat(attCoord["long"]), 0);
			// line.setTessellate(true);
			// line.setAltitudeMode(ge.ALTITUDE_CLAMP_TO_GROUND);
			// multiGeometry.getGeometries().appendChild(line);
			
			var lineMark = ge.createPlacemark('');
			var lineString = ge.createLineString('');
			lineMark.setGeometry(lineString);
			lineString.setAltitudeMode(ge.ALTITUDE_RELATIVE_TO_GROUND);   //显示海拔相对位置
			addPointsToLineString(lineString, parseFloat(ipCoord["lat"]), parseFloat(ipCoord["long"]), parseFloat(attCoord["lat"]), parseFloat(attCoord["long"]), 20);    //输入2端点经纬度
			lineMark.setStyleSelector(ge.createStyle(''));
			var lineStyle = lineMark.getStyleSelector().getLineStyle();
			lineStyle.setWidth(2);  //粗细
			lineStyle.getColor().set('9900ffff'); //颜色
			ge.getFeatures().appendChild(lineMark);
			
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


		earthip.animation.ip = selectedIp;
		earthip.animation.index = -1;
		earthip.animation.animationView();
        // ge.getOptions().setFlyToSpeed(0.1);
// 		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
//         lookAt.setTilt(35.0);
// 		lookAt.setLatitude(parseFloat(attCoord["lat"]));
// 		lookAt.setLongitude(parseFloat(attCoord["long"]));
// 		lookAt.setRange(50000.0);
// 		ge.getView().setAbstractView(lookAt);
	};
	earthip.animation = {};
	earthip.animation.ip = "";
	earthip.animation.index = -1;
	earthip.animation.animationView = function() {
		setTimeout(function() {
			var attCoord;
			if (earthip.animation.index >= earthip.allData[earthip.animation.ip].length) {
				return;
			}
		
			if (earthip.animation.index < 0) {
				attCoord = earthip.getIpCoord(earthip.animation.ip);
			} else {
				attCoord = earthip.getIpCoord(earthip.allData[earthip.animation.ip][earthip.animation.index]);
			}
		
	        ge.getOptions().setFlyToSpeed(0.1);
			var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
	        lookAt.setTilt(35.0);
			lookAt.setLatitude(parseFloat(attCoord["lat"]));
			lookAt.setLongitude(parseFloat(attCoord["long"]));
			lookAt.setRange(50000.0);
			ge.getView().setAbstractView(lookAt);
		
			earthip.animation.index ++;
			setTimeout(earthip.animation.animationView, 5000);
		}, (earthip.animation.index < 0) ? 0 : 5000);
	}
	earthip.showSingleIp = function(selectedIp) {
		var attCoord = earthip.getIpCoord(selectedIp);
		
		earthip.addPoint(attCoord, attCoord["address"] + "(被窃文件10个)");
		
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


(function() {
	var datetime = document.getElementById("datetime");
	setTime();  
	  function setTime(){  
	      var mydate=new Date();  
	      var year = mydate.getFullYear();  
	      var mymonth=parseInt(mydate.getMonth()+1)<10?"0"+(mydate.getMonth()+1):mydate.getMonth()+1;  
	      var myday= mydate.getDate();  
	      var myweekday=mydate.getDay();  
	      var myHours = parseInt(mydate.getHours())<10?"0"+(mydate.getHours()):mydate.getHours();  
	      var myMinutes = mydate.getMinutes()<10?"0"+mydate.getMinutes():mydate.getMinutes();  
	      var mySeconds = parseInt(mydate.getSeconds())<10?"0"+mydate.getSeconds():mydate.getSeconds();  
	      if(myweekday == 0)  
	      weekday=" 星期日 ";  
	      else if(myweekday == 1)  
	      weekday=" 星期一 ";  
	      else if(myweekday == 2)  
	      weekday=" 星期二 ";  
	      else if(myweekday == 3)  
	      weekday=" 星期三 ";  
	      else if(myweekday == 4)  
	      weekday=" 星期四 ";  
	      else if(myweekday == 5)  
	      weekday=" 星期五 ";  
	      else if(myweekday == 6)  
	      weekday=" 星期六 ";  
	     datetime.innerHTML=year+"年"+mymonth+"月"+myday+"日 <br>"+myHours+":"+myMinutes+":"+mySeconds+" "+weekday;  
	     setTimeout(setTime,1000);  
	  }  
}());
