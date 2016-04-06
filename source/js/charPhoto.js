define(['tool'],function(Tools){
	function CharPhote(canvasId,textContainerId){
		var imgUrl = {
			normal: '',
			medium: '',
			small: ''
		};
		var canvas = Tools.isNull(document.getElementById(canvasId));
		var textDiv = Tools.isNull(document.getElementById(textContainerId));
		var ctx = canvas.getContext('2d');
		var img = createImage();
		img.onload = init();
		
		function createImage(url){
			return new Image(url);
		}
		
		function init(){		
			var width = img.width;
			var height = img.height;
			
			canvas.style.display = 'none';
			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img,0,0);
			
			var imgData = ctx.getImageData(0,0,width,height);
			var imgDataArr = imgData.data;
			
			textDiv.style.width = width + 'px';
			var html = '';
			for(var h= 0;h< height; h +=12){
				var p = '<p>';
				for(var w = 0;w<width; w +=6){
					var index = (w+ h*width)*4;
					var r = imgDataArr[index+0];
					var g = imgDataArr[index+1];
					var b = imgDataArr[index+2];
					var a = getGray(r,g,b);
					p += '<span>'+toText(a)+'</span>';
				}
				p +='</p>';
				html +=p;
			}
			textDiv.innerHTML = html;
		}
		
		
		//转化成灰度值
		function getGray(r, g, b) {
			return 0.299 * r + 0.578 * g + 0.114 * b;
		}
		
		// 根据灰度生成相应字符：反转映射
		function toTextRevert(g) {
			if (g <= 30) {
				return '&nbsp;';
			} else if (g > 30 && g <= 60) {
				return ':';
			} else if (g > 60 && g <= 120) {
				return 'l';
			}  else if (g > 120 && g <= 150) {
				return 'o';
			} else if (g > 150 && g <= 180) {
				return 'x';
			} else if (g > 180 && g <= 210) {
				return 'a';
			} else if (g > 210 && g <= 240) {
				return 'm';
			}  else {
				return '#';
			}
		}
		//根据灰度生成相应字符:正常映射
		function toText(g) {
			if (g <= 30) {
				return '#';
			} else if (g > 30 && g <= 60) {
				return 'm';
			} else if (g > 60 && g <= 120) {
				return 'a';
			}  else if (g > 120 && g <= 150) {
				return 'x';
			} else if (g > 150 && g <= 180) {
				return 'o';
			} else if (g > 180 && g <= 210) {
				return 'l';
			} else if (g > 210 && g <= 240) {
				return ':';
			}  else {
				return '&nbsp;';
			}
		}

	}
});