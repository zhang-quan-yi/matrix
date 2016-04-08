define(['tool'], function(Tools) {

    function CharPhoto(canvasId) {

        const FOOTER_HEIGHT = 60;
        const CANVAS_WIDTH = window.innerWidth;
        const CANVAS_HEIGHT = window.innerHeight - FOOTER_HEIGHT;
		const DELTA_TIME = 30;
		const IMG_HEIGHT = 814;
		const FONT_COLOR = 'rgba(35,255,35,0.8)';
		const END_WORD = "============================== YOU ARE IN ==============================";
		const SITE_URL = "============================== WWW.DOMTRIC.COM ==============================";
		var	srcx,
			startx,
			starty = 20,
			srcy = starty,
			deltax = 6,
			deltay = 12,
			canvas,
        	ctx,
			img = new Image(),
			url = 'web/images/preface-portrait-s.png';

        img.src = url;
		//获取canvas
		canvas = Tools.isNull(document.getElementById(canvasId));
		ctx = canvas.getContext('2d');
		canvas = initCanvas();
		canvas = setCanvasVisible(true);
		img.onload = init;

        function init() {
            var width,
				height,
				imgData,
				charArray,
				ratio,
				timeId = null;
			//计算scale比列，让图片适应屏幕
			ratio = getImgRatio();
			//ratio = 1;
			width = ~~(img.width*ratio);
			height = ~~(img.height*ratio);
			img.width = width;
			img.height = height;
			srcx = startx = (window.innerWidth - width) / 2;

			//获取图片像素信息
            imgData = getPixelData(ctx,img,ratio);
			//将像素信息转化成字符数组
			charArray = getCharMap(imgData.data,width, height);

			imgData = null;
			ctx.scale(1,1);
			//清空画布
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			//显示画布
            canvas= setCanvasVisible(true);

			//设置字体、颜色
			setFontStyle('bold 12px serif', FONT_COLOR);
			//开始输出到canvas
			if(!timeId){
				timeId = setInterval(function() {
					var char = getChar(charArray);
					if (char) {
						draw(char);
					} else {
						//结束语
						ctx = printText(ctx, END_WORD,'center',window.innerWidth/2,srcy+12);
						clearInterval(timeId);
						setTimeout(function(){
							ctx = printText(ctx,SITE_URL,'center',window.innerWidth/2,srcy+26);
						},100);
						timeId = null;
					}
				}, DELTA_TIME);
			}
        }

		function getChar(array){
			var char = array.shift();
			if(!char){
				return false;
			}
			if(char == '_'){
				srcx +=deltax;
				return getChar(array);
			}else{
				return char;
			}
		}
		function getImgRatio(){
			var properHeight = (CANVAS_HEIGHT-starty * 2 - 10-14);
			var ratio;
			properHeight = Math.min(IMG_HEIGHT, properHeight);
			ratio = +((properHeight/IMG_HEIGHT).toFixed(2));
			return ratio;
		}
		function printText(ctx,word,align,posx,posy){
			ctx.textAlign = align||'center';
			ctx.fillText(word, posx, posy);
			return ctx;
		}
		function getPixelData(ctx,img,ratio){
			//scale img for proper size
			//ctx.scale(ratio, ratio);
			ctx.drawImage(img, 0, 0,img.width,img.height);
			return ctx.getImageData(0, 0, img.width, img.height);
		}
		function getCharMap(imgDataArr,width,height){
			var charArray = [];
			for (var h = 0; h < height; h += 12) {
				for (var w = 0; w < width; w += 6) {
					var index = (w + h * width) * 4;
					var r = imgDataArr[index + 0];
					var g = imgDataArr[index + 1];
					var b = imgDataArr[index + 2];
					var a = getGray(r, g, b);
					charArray.push(toText(a));
				}
				charArray.push('=');
			}
			return charArray;
		}
		function setCanvasVisible(tag){
			canvas.style.display = tag?'block':'none';
			return canvas;
		}
		function initCanvas(){
			canvas.width = CANVAS_WIDTH;
			canvas.height = CANVAS_HEIGHT;
			canvas.setAttribute('class','');
			canvas.style.width = CANVAS_WIDTH + 'px';
			canvas.style.height = CANVAS_HEIGHT + 'px';
			return canvas;
		}
		function setFontStyle(font,color){
			ctx.fillStyle = color;
			ctx.font = font;
			return ctx;
		}
        //draw
        function draw(char) {
			//是否换行
            if (char == '=') {
                srcy += deltay;
                srcx = startx;
				//clear cursor
                return true;
            } else {
                srcx += deltax;
				//clear cursor
				//ctx.fillStyle = 'black';
				//ctx.fillRect(srcx-0.5, srcy - deltay, 7,12);

				//ctx.fillStyle = FONT_COLOR;
                //draw text
				//if(char != ':'){
					ctx.fillStyle = 'rgba(35,255,35,'+ char +')';
					ctx.fillRect(srcx+deltax, srcy - deltay, 4, 10);
				//}else{
				//	ctx.fillText(char, srcx, srcy);
				//}

				//draw cursor
				//ctx.fillRect(srcx+deltax, srcy - deltay, 6, 12);
                return true;
            }
        }

        //转化成灰度值
        function getGray(r, g, b) {
            return 0.299 * r + 0.578 * g + 0.114 * b;
        }

        // 根据灰度生成相应字符：反转映射
        function toTextRevert(g) {
            if (g <= 30) {
                return '_';
            } else if (g > 30 && g <= 60) {
                return ':';
            } else if (g > 60 && g <= 120) {
                return 'l';
            } else if (g > 120 && g <= 150) {
                return 'o';
            } else if (g > 150 && g <= 180) {
                return 'x';
            } else if (g > 180 && g <= 210) {
                return 'a';
            } else if (g > 210 && g <= 240) {
                return 'm';
            } else {
                return '#';
            }
        }

        //根据灰度生成相应字符:正常映射
        //function toText(g) {
        //    if (g <= 30) {
        //        return '#';
        //    } else if (g > 30 && g <= 60) {
        //        return 'm';
        //    } else if (g > 60 && g <= 120) {
        //        return 'a';
        //    } else if (g > 120 && g <= 150) {
        //        return 'x';
        //    } else if (g > 150 && g <= 180) {
        //        return 'o';
        //    } else if (g > 180 && g <= 210) {
        //        return 'l';
        //    } else if (g > 210 && g <= 240) {
        //        return ':';
        //    } else {
        //        return '_';
        //    }
        //}
		function toText(g) {
			g +=20;
			if (g <= 240) {
				return (g/255).toFixed(2);
			} else {
				return '_';
			}
		}

    }

    return CharPhoto;
});