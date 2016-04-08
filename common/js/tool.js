define([],function(){
	var Tool = {
		//canvas设置
		scaleCanvas: scaleCanvasWithRatio,
		//使用fragment为网页添加新节点
		appendToPage: appendToPage,
		//判断是否是数组
		isArray: isArray,
		isNull: isNull,
		isEmpty: isEmpty
	};
//获取宽度
//http://www.quirksmode.org/dom/w3c_cssom.html#screenview
function getWidth(media){
	var result;
	switch (media){
		case 'brower':
		//compatible with:
		//IE 5.5 IE 6 IE 7 IE8 IE9pr3 
		//FF 3.0 FF 3.5	FF 3.6	FF 4b1	
		//Saf 4.0 Win	
		//Saf 5.0 Win	
		//Chrome 4	Chrome 5	
		//Opera 10.10	Opera 10.53	Opera 10.60	
		//Konqueror 4.x
			result = window.innerWidth;
			break;
		default:

	}
	return result;
}
function isNull(value){
	if(value == null){
		throw("specific can not be null");
	}
	return value;
}
function isEmpty(){
	return (value === undefined || value === null || value === 0 || value === '');
}
function appendToPage(container,children){
	if(!container){
		throw("a container is required!");
	}
	var fragment = document.createDocumentFragment();
	if(isArray(children)){
		children.foreach(function(item){
			fragment.appendChild(item);
		});
	}else{
		fragment.appendChild(children);
	}
	container.appendChild(fragment);
	fragment = null;
	return container;
}
function isArray(obj){
	return (typeof obj == 'object'&& obj instanceof Array);
}
	/**
	*init canvas
	*devicePixelRatio:
	*if a devicePixelRatio = 2;this mean 100px logical value equals to 200px device value
	*webkitBackingStorePixelRatio:
	*whenever you draw anything into the canvas's context,
	*you're really having the browser write it to the underlying storage for the canvas (called its backing store)
	*http://www.html5rocks.com/en/tutorials/canvas/hidpi/?redirect_from_locale=zh
	*/
	/**
	 * setting canvas taking into
	 * account the backing store pixel ratio and
	 * the device pixel ratio.
	 *
	 * @author Paul Lewis
	 * @param {Object} opts The params for drawing an image to the canvas
	 */
	function scaleCanvasWithRatio(_canvas,flag){
	 if(!_canvas){
		 throw("A canvas is required");
	 }
	 //get the canvas and context
	 var canvas = _canvas,
	 context = canvas.getContext('2d'),
	 auto;
	 
	 //finally query the various pixel ratios
	 devicePixelRatio = window.devicePixelRatio||1,
	 backingStoreRatio = 
		 context.webkitBackingStorePixelRatio||
		 context.mozBackingStorePixelRatio||
		 context.msBackingStorePixelRatio||
		 context.oBackingStroePixelRatio||
		 context.backingStroePixelRatio||1,
	 ratio = devicePixelRatio/backingStoreRatio;
	 
	 //ensure wo hae a value set for auto.
	 //if auto is set to false then we will simply 
	 //not upscale the canvas
	 //and the default behaviour will be maintained
	 if(typeof flag === 'undefined'){
		 auto = true;
	 }
	 //upscale the canvas if the two ratios don't match
	 if(auto){
		 var oldWidth = window.innerWidth;
		 var oldHeight = window.innerHeight;
		 
		 //scale width && height with ratio
		 //this means (ratio*ratio) times the amount 
		 //of memory is required to service your 
		 //canvas element
		 canvas.width = oldWidth*ratio;
		 canvas.height = oldHeight*ratio;
		 
		 canvas.style.width = oldWidth + 'px';
		 canvas.style.height = oldHeight +'px';
		 
		 //now scale the content to encouter
		 //the face that we've manully scaled
		 //our canvas element
		 context.scale(ratio,ratio);
	 }
	 return canvas;
 }
	return Tool;
});