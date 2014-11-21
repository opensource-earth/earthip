(function() {
	var ge;
	var map;
	var db;
    var markLatLng;
    var isShowMap = false;
    var selectedAssailantIp;
    google.load("earth", "1", {'language': 'zh_cn' , "other_params":"sensor=false"});

    function init() {
		var Uints = ipData;
		db = new SQL.Database(Uints); /* 数据库初始化 */
	
		google.earth.createInstance('map3d', initCB, failureCB); /* 3D地图初始化 */
		
		/* 2D地图初始化 */
		var mapOptions = {
		    zoom: 12,
		    center: new google.maps.LatLng(-28.643387, 153.612224),
		    mapTypeControl: true,
		    mapTypeControlOptions: {
		        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
		        position: google.maps.ControlPosition.BOTTOM_CENTER
		    },
		    panControl: true,
		    panControlOptions: {
		        position: google.maps.ControlPosition.TOP_RIGHT
		    },
		    zoomControl: true,
		    zoomControlOptions: {
		        style: google.maps.ZoomControlStyle.LARGE,
		        position: google.maps.ControlPosition.LEFT_CENTER
		    },
		    scaleControl: true,
		    streetViewControl: true,
		    streetViewControlOptions: {
		        position: google.maps.ControlPosition.LEFT_TOP
		    }
		  }
		  map = new google.maps.Map(document.getElementById('map-canvas'),
		                                mapOptions);
    }

    function initCB(instance) {
      ge = instance;
      ge.getWindow().setVisibility(true);
	  ge.getNavigationControl().setVisibility(ge.VISIBILITY_SHOW);
 
	  locationToChina();
	
	/* 挂载3个按钮的事件 */
	  document.getElementById("animation").onclick = toggleRotate;
	  document.getElementById("position").onclick = locationToChina;
      document.getElementById("mapswitch").onclick = mapSwitchState;
    }
	
    function failureCB(errorCode) {
    }

    google.setOnLoadCallback(init);
	
	/* 绘制点到点的弧线的函数 */
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
	function toggleRotate() { /* 旋转动画切换 */
//        if(selectedAssailantIp){
//            return startRemoveAnim();
//        }
		if (isRotate) {
			stopRotate();
		} else {
			startRotate();
		}
	}
	function startRotate() { /* 开始旋转 */
		if (isRotate) return;
		isRotate = true;
		
		ge.getOptions().setFlyToSpeed(ge.SPEED_TELEPORT);
		google.earth.addEventListener(ge, "frameend", rotateEarth);   //设置事件，地图画完事件
		rotateEarth();  //第一次人工启动下。记住不加这一行，可能不旋转。
	}
	function stopRotate() {  /* 结束旋转 */
		isRotate = false;
		google.earth.removeEventListener(ge,"frameend", rotateEarth);
		ge.getOptions().setFlyToSpeed(0.5);
	}
    function rotateEarth() { /* 真正的旋转效果函数 */
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
                   0, 0, 25000000);
		ge.getView().setAbstractView(lookAt);
	}
	
	function locationToChina() { /* 定位到中国函数 */
        if (isRotate) {
            stopRotate();
        }
  	    var la = ge.createLookAt('');
  	    la.set(33,105.46, 0, ge.ALTITUDE_RELATIVE_TO_GROUND, 0, 0, 25000000); //最后一个参数是放大倍数，可根据页面大小调整.  第一、二位置是中国中心位置经纬度
  	    ge.getView().setAbstractView(la);
    }
 
    function mapSwitchState() { /* Earth和Map地图切换函数。通过设置对应Div的是否现实来实现切换效果 */
        if(!markLatLng){
            return;
        }
        if(!isShowMap){
			document.getElementById("map3d").style.visibility = "hidden";
            return earthip.showMapView();
        }
        isShowMap = false;
        document.getElementById("map-canvas").style.visibility = "hidden";//visible
		document.getElementById("map3d").style.visibility = "visible";
    }
 
    function startRemoveAnim() {
        earthip.animation.ip = selectedAssailantIp;
        earthip.animation.index = 0;
        earthip.animation.animationView();
    }
	/***** ip.. ****/
	var earthip = {};
	earthip.attData = [];
	earthip.allData = [];
	earthip.ipCoord = Array;
	earthip.IpData = function() { /* 获取ip数据函数 */
		m.request({method: "GET", url: "db.jsp"}).then(function(data) {
			for (var key in data) {
				earthip.attData.push(key);
			}
			earthip.allData = data;
		});
		
		m.request({method: "GET", url: "ip.json"}).then(function(data) {
			earthip.ipCoord = data;
		});
	};
	earthip.overlay = function() { /* 添加overlay，现在没有用到 */
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
	earthip.getIpCoord = function(ipStr) { /* 通过ip查询经纬度信息函数 */
		var ipCoord = earthip.ipCoord[ipStr];
		if (ipCoord != undefined) {
			return ipCoord;
		}
		
		var iparr = ipStr.split('.');
		var ipint = [];
		for (var x = 0; x < iparr.length; x++) {
			ipint[x] = parseInt(iparr[x]);
		}   
		var ip = (256 * 256 * 256 * ipint[0] + 256 * 256 * ipint[1] + 256 * ipint[2] + ipint[3]); 
	
		var res = db.exec("SELECT Lat, Lon, IP_City FROM IPToCity WHERE IP_Start < " + ip + " AND  IP_End > " + ip)[0];
		var values = res.values;
		if (values.length > 0) {
			return {"lat" : values[0][0], "long" : values[0][1], "address" : values[0][2]};	
		}
		return {"lat" : "22.63", "long" : "120.31", "address" : "台湾"};
		
		// return earthip.ipCoord[ipStr];
	};
	earthip.removeAll = function() { /* 删除所有的地图元素，用来删除前一次添加的ip的点 */
		var features = ge.getFeatures().getChildNodes();
		for (var i = 0; i < features.getLength(); i ++) {
			ge.getFeatures().removeChild(features.item(i));
		}
	};
	earthip.addPoint = function(coord, name, type) { /* 添加一个IP点到地图 */
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
	earthip.showGroupIp = function(selectedIp) { /* 现实一组IP点，对应于点击攻击者ip */
        stopRotate();
        selectedAssailantIp = selectedIp;
		var attCoord = earthip.getIpCoord(selectedIp);
		var ips = earthip.allData[selectedIp];
		var showword;
        markLatLng = new google.maps.LatLng(parseFloat(attCoord["lat"]), parseFloat(attCoord["long"]));
		
		showword = attCoord["address"] + "(控制主机:"+ips.length+")";
				
		//
		if(selectedIp == "122.117.72.151"){
			showword = attCoord["address"] + "(控制主机111:"+ips.length+")";
		}
	
		if(selectedIp == "122.124.137.19"){
			showword = attCoord["address"] + "(控制主机222:"+ips.length+")";
		}		
		
		earthip.addPoint(attCoord, showword, 1);
 
        var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
        lookAt.setTilt(35.0);
        // 设置新的纬度值和经度值。
        lookAt.setLatitude(parseFloat(attCoord["lat"]));
        lookAt.setLongitude(parseFloat(attCoord["long"]));
        lookAt.setRange(50000.0);
        // 更新 Google 地球中的视图。
        //ge.getView().setAbstractView(lookAt);
	
		var multiGeometry = ge.createMultiGeometry('');
		for (var idx = 0; idx < ips.length; idx ++) { /* 通过for循环添加所有的ip */
			var ipCoord = earthip.getIpCoord(ips[idx]);
			
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
			earthip.addPoint(ipCoord, ipCoord["address"]);
		}
		
		var multGeoPlacemark = ge.createPlacemark('');
		multGeoPlacemark.setGeometry(multiGeometry);
		
		multGeoPlacemark.setStyleSelector(ge.createStyle(''));
		var lineStyle = multGeoPlacemark.getStyleSelector().getLineStyle();
		lineStyle.setWidth(10);
		lineStyle.getColor().set('ffff0000');
		
		ge.getFeatures().appendChild(multGeoPlacemark);

		startRemoveAnim();
	};
	earthip.animation = {};
	earthip.animation.ip = "";
	earthip.animation.index = -1;
	earthip.animation.animationView = function() { /* 点击攻击者ip后的地图动画，通过timer来实现对所有被攻击ip的浏览动画 */
		setTimeout(function() {
			var attCoord;
			
			if(earthip.animation.index >= 3){
				attCoord = earthip.getIpCoord(earthip.animation.ip);
				ge.getOptions().setFlyToSpeed(0.5);
				var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
				lookAt.setTilt(35.0);
				lookAt.setLatitude(parseFloat(attCoord["lat"]));
				lookAt.setLongitude(parseFloat(attCoord["long"]));
				lookAt.setRange(50000.0);
				ge.getView().setAbstractView(lookAt);
				return;
			}
			
			
			if (earthip.animation.index >= earthip.allData[earthip.animation.ip].length) {
				return;
			}
		
			if (earthip.animation.index < 0) {
				attCoord = earthip.getIpCoord(earthip.animation.ip);
			} else {
				attCoord = earthip.getIpCoord(earthip.allData[earthip.animation.ip][earthip.animation.index]);
			}
		
	        ge.getOptions().setFlyToSpeed(0.5);
			var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
	        lookAt.setTilt(35.0);
			lookAt.setLatitude(parseFloat(attCoord["lat"]));
			lookAt.setLongitude(parseFloat(attCoord["long"]));
			lookAt.setRange(50000.0);
			ge.getView().setAbstractView(lookAt);
			earthip.animation.index ++;
			setTimeout(earthip.animation.animationView, 2000);
			
		}, (earthip.animation.index == 0) ? 0 : 2000);
	}
	earthip.showSingleIp = function(selectedIp) { /* 显示单个ip。对应于点击被攻击者ip */
        stopRotate();
		var attCoord = earthip.getIpCoord(selectedIp);
		var ipnum = random(5,50);
		earthip.addPoint(attCoord, attCoord["address"]+ "(被窃数据量:"+ipnum+"M)");
		
		//   	    var la = ge.createLookAt('');
		// la.set(attCoord[0], attCoord[1], 0, ge.ALTITUDE_RELATIVE_TO_GROUND, -8.541, 66.213, 8000);
        ge.getOptions().setFlyToSpeed(0.5);
 
 	   /* 一个简单的转到对应点的动画效果 */
		var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
        lookAt.setTilt(35.0);
		// 设置新的纬度值和经度值。
		lookAt.setLatitude(parseFloat(attCoord["lat"]));
		lookAt.setLongitude(parseFloat(attCoord["long"]));
		lookAt.setRange(50000.0);
		// 更新 Google 地球中的视图。
		ge.getView().setAbstractView(lookAt);
 
        markLatLng = new google.maps.LatLng(parseFloat(attCoord["lat"]), parseFloat(attCoord["long"]));
 
	};
 
	earthip.showMapView = function() { /* 显示2D地图 */
        isShowMap = true;
        initialize(markLatLng);
		document.getElementById("map-canvas").style.visibility = "visible";
    };
 
	earthip.controller = function() { /* 这个函数暂时可以不用管。是用的一个js框架需要的 */
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
		}.bind(this);
	};
	earthip.view = function(ctrl) { /* 通过框架返回的html的效果，可以不管，这里动态形成左边ip的列表 */
		return [m("div.pure-u-1-2", m("ul", [m("li.head", "攻击IP"), earthip.attData.map(function(item, iIndex) {
			if (item == ctrl.selectedIp()) {
				return m("li", m("a.highlighted[href='#']", {onclick: ctrl.selected}, item));
			} else {
				return m("li", m("a[href='#']", {onclick: ctrl.selected}, item));
			}
		})])), m("div.pure-u-1-2", m("ul", [m("li.head", "被攻击IP"), earthip.allData[ctrl.selectedIp()].map(function(item, iIndex) {
			if (item == ctrl.selectedSubIp()) {
				return m("li", m("a.selected[href='#']", {onclick: ctrl.attipSelected}, item));
			} else {
				return m("li", m("a[href='#']", {onclick: ctrl.attipSelected}, item));
			}
		})]))];
	};

	m.module(document.getElementById("iplist"), earthip);
}());
 
function initialize(location) { /* 地图初始化 */
    var myLatlng = new google.maps.LatLng(39.916056,116.369505);
    var mapOptions = {
        zoom: 12,
        center: location,
        mapTypeControl: true,
        mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.BOTTOM_CENTER
        },
        panControl: true,
        panControlOptions: {
        position: google.maps.ControlPosition.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.LEFT_CENTER
        },
        scaleControl: true,
        streetViewControl: true,
        streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
    }
    }
    map = new google.maps.Map(document.getElementById('map-canvas'),
                              mapOptions);
    var marker = new google.maps.Marker({
                                        position: location,
                                        map: map,
                                        title: 'Hello World!'
                                        });
    marker.setMap(map);
}
function random(min,max){

    return Math.floor(min+Math.random()*(max-min));

}
/* 时间现实的js代码 */
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

(function() {
	// var height = 80;
// 	var width  = 100;
// 	//Create graphics object from the graphics div
//     var gr = new jxGraphics(document.getElementById('graphics'));
// 	//Define pens to draw outline of the shapes
// 	var penRed = new jxPen(new jxColor('red'), '1px');
//
// 	var curvePoints = [new jxPoint(0, 0), new jxPoint(100, 80)];
//
// 	// var line = new jxLine(new jxPoint(0, 0), new jxPoint(100, 80), penRed);
// 	var curve = new jxClosedCurve(curvePoints, penRed)
// 	function setTime() {
// 		var y = Math.floor(Math.random() * (height + 1));
//
// 		var curvePoints = new Array();
// 		curvePoints[0] = new jxPoint(0, 0);
// 		curvePoints[1] = new jxPoint(100, y);
// 		line.points = curvePoints;
// 		line.draw(gr);
//
// 		setTimeout(setTime,100);
// 	}
//
// 	setTime();
}());
