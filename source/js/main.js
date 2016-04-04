require(['zhl','rain','tool','logo'],function(){
	var zhl = require('zhl'),
		Rain = require('rain');
		Logo = require('logo');
		//初始化
		zhl.rain = new Rain("preface");
		zhl.logo = Logo("logo");
		//start
		var timeId = zhl.rain.startRain();
		setTimeout(function(){
			zhl.logo.moveLight();
			setTimeout(function(){
				zhl.rain.removeCanvas(
					function(){
						zhl.rain = null;
				});
				zhl.logo.extendAway(
					function(){
						zhl.logo = null;
				});
			},2800);
		},5000);
		
});