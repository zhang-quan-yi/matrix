define(['tool'],function(Tools){

	function rain(canvasId){
		
		const SENTENCE_WIDTH = 20;
		const HEAD_HEIGHT = 40;
		const FOOTER_HEIGHT = 60;
		const FONT_COLOR = 'rgba(35,255,35,.8)';
		const EXTEND_AWAY = 'preface-hidden';
		var self = this;
		var canvas,ctx,sentenceNum,sentenceArr,startId;
		
		this.startRain = startRain;
		this.removeCanvas = removeCanvas;
		//通过id获取canvas元素
		canvas = getCanvas(canvasId||'');
		canvas = Tools.scaleCanvas(canvas);
		ctx = canvas.getContext('2d');
		//设置画笔颜色
		ctx.fillStyle = FONT_COLOR;
		//计算屏幕中下落的段落的列数
		sentenceNum = calculateIndex();
		//生成由于绘制段落的数组，
		//该数组的元素为段落的一个实例
		sentenceArr = generateData(sentenceNum);
		//获取canvas
		function getCanvas(id){
			var canvas = document.getElementById(id);
			if(!canvas){
				throw("Canvas is not found!");
			}
			return canvas;
		}
			
		 //获取屏幕宽度，计算大概的纵向条目
		 // return int
		 function calculateIndex(){
			 return Math.round((canvas.width/SENTENCE_WIDTH));
		 }
		 //生成一个段落的实例
		 //包括开始位置，结束位置，字体大小
		 //return object
		 function createSentence(index){
			 return { 
				 size: ~~((Math.random()-0.5)*20+10),
				 srcy: ~~(canvas.height*Math.random()*0.8),
				 desy: 0,
				 xPos: index*SENTENCE_WIDTH,
				 db: 4
				 };
		 }
		 //生成用于绘制的数组
		 //return array
		 function generateData(num){
			 var arr = [],i=0;
			 for(;i<num;i++){
				 arr[i] = createSentence(i);
			 }
			 return arr;
		 }
		  //根据生成的array 绘制
		function draw(){
			//绘制黑色透明背景
			ctx.fillStyle = 'rgba(0,0,0,.05)';
			ctx.fillRect(0, 0, window.innerWidth, window.innerHeight-FOOTER_HEIGHT);
			//绘制页脚白色透明背景
			ctx.fillStyle = 'rgba(255,255,255,.08)';
			ctx.fillRect(0, window.innerHeight-FOOTER_HEIGHT, window.innerWidth, FOOTER_HEIGHT);
			//绘制段落
			ctx.fillStyle = FONT_COLOR;
			//遍历段落数组
			/*
			注：这里借鉴了网友的代码	http://zhidao.baidu.com/link?url=fpG_0yICynFlAiOxDAeppeLdcJqRxHk1SkYYlOgFITVKCRFIuN3fqAenNDd8J4MshxGcqpRhhC3wmaQhXjo4Vq1kKbTXAZWmob5J0c00FMy
			*/	
			sentenceArr.map(function(value,index){
				//计算到达底部距离
				var dist = value.srcy - (window.innerHeight-value.desy);
				//到达底部
				if(dist<=0){
					//
					if(value.db<2){
						//不绘制新的字符，
						//只将旧的字符下移1px
						//制作拖影效果
						ctx.font ='bold '+ value.size +'px serif';
						ctx.fillText(value.text, value.xPos, value.srcy);
						value.db++;
					}else{
						//绘制新的字符
						//随机生成Unicode编码，获取日文字符
						value.text = String.fromCharCode(12448+Math.round(95*Math.random()));
						//设置字体
						ctx.font ='bold '+ value.size +'px serif';
						//绘制
						ctx.fillText(value.text, value.xPos, value.srcy);
						//设置重叠字段
						//当value的db<2时，value.text值不变，只是向下移动1px,模拟出拖影效果
						value.db = 0;
					}		
				}
				//生成新的段落
				//增加的随机数用于延时作用，
				if(dist>(~~Math.random() * 1e4)){
					 sentenceArr[index] = createSentence(index);
				}
				//设置y的偏移量
				if(value.db<2){
					value.srcy++;
				}else{
					value.srcy +=value.size;
				}
			 });
		 }
		//开始
		function startRain(){
			 return startId = setInterval(draw,30);
		}
		//清空canvas
		function clear(canvas){
			
		}
		//结束
		function end(timeId){
			clearInterval(timeId);
			start = null;	
			canvas.style.display = 'none';
		}
		//remove
		function removeCanvas(callback){
			canvas.setAttribute("class",EXTEND_AWAY);
			setTimeout(function(){
				end(startId);
				callback();
			},3500);
		}
	
	}
	return rain;
});