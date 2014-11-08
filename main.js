(function() {
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
	
	
	/***** ip.. ****/
	
	var earthip = {};
	earthip.attData = [];
	earthip.IpData = function() {
		return m.request({method: "GET", url: "db.json"}).then(function(data) {
			for (var key in data) {
				earthip.attData.push(key);
			}
		});
	};
	earthip.controller = function() {
		this.selectedIp= m.prop("122.124.137.19");
		this.attip = earthip.IpData();

		this.selected = function(index) {
			this.selectedIp(index.target.innerText);
			m.redraw(true);
		}.bind(this);
		this.attipSelected = function(index) {
			alert(index.target.innerText);
		
			var points = ge.getFeatures().getChildNodes();
			for (var i = 0; i < points.getLength(); i ++) {
				ge.getFeatures().removeChild(points.item(i));
			}
		
			// 创建地标。
			var placemark = ge.createPlacemark('');
			// 设置地标的位置。
			var point = ge.createPoint('');
			point.setLatitude(39.98881);
			point.setLongitude(116.474828);
			placemark.setGeometry(point);
			// 向 Google 地球添加地标。
			ge.getFeatures().appendChild(placemark);
			
			
			// 获取当前视图。
			var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);
			// 设置新的纬度值和经度值。
			lookAt.setLatitude(39.98881);
			lookAt.setLongitude(116.474828);
			// 更新 Google 地球中的视图。
			ge.getView().setAbstractView(lookAt);
		}
	};
	earthip.view = function(ctrl) {
		return [m("div.pure-u-1-2", m("ul", [m("li.head", "攻击者IP"), earthip.attData.map(function(item, iIndex) {
			return m("li", m("a[href='#']", {onclick: ctrl.selected}, item));
		})])), m("div.pure-u-1-2", m("ul", [m("li.head", "被攻击者IP"), ctrl.attip()[ctrl.selectedIp()].map(function(item, iIndex) {
			return m("li", m("a[href='#']", {onclick: ctrl.attipSelected}, item));
		})]))];
	};

	m.module(document.getElementById("iplist"), earthip);
	
}());


