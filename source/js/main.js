require(['zhl','rain','tool','logo','porfacePortrait','charPhoto'],function(){
	var zhl   = require('zhl'),
		Rain  = require('rain'),
		Logo  = require('logo'),
		Tools = require('tool'),
		Portrait = require("porfacePortrait"),
		CharPhoto = require('charPhoto');
		/*
		//初始化
		zhl.rain = new Rain("preface");
		zhl.logo = Logo("logo");
		zhl.portrait = Portrait();
		//监听 escape按钮的点击事件
		zhl.portrait.addListener(onEscape);
		//START
		function onEscape(){
			setTimeout(function(){
			//start rain 
				var timeId = zhl.rain.startRain();
				//rain will going on for !!5000ms
				setTimeout(function(){
					//收回zhl.portrait资源
					zhl.portrait.removePortrait();
					deleteProperty(zhl.portrait);
					//===================
					//显示系统公告
					//showCaution();
					//===================
					//显示 MATRIX logo
					//logo show will going on !!3000ms 
					zhl.logo.moveLight();
					setTimeout(function(){
						//stop rain,stop logo show
						//this will going on !!3500ms
						//remove element on page
						zhl.rain.removeCanvas(
							function(){
								deleteProperty(zhl.rain);
						});
						zhl.logo.extendAway(
							function(){
								deleteProperty(zhl.logo);
						});
					},2800);
				},5000);	
			},500);
		}
		*/
		zhl.charPhoto = CharPhoto('preface');
		//显示公告
		function showCaution(){
			var caution = document.getElementById("caution");
			if(caution){
				caution.style.opacity = 1;
			}
		}
		function deleteProperty(Obj){
			Obj = null;
			delete Obj;
		}
});