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
 function scaleCanvasWithRatio(canvas,auto){
	 if(!canvas){
		 throw("A canvas is required");
	 }
	 //get the canvas and context
	 var canvas = opts.canvas,
	 content = canvas.getContext('2d'),
	 auto = auto||null,
	 
	 //finally query the various pixel ratios
	 devicePixelRatio = window.devicePixelRatio||1,
	 backingStoreRatio = 
		 content.webkitBackingStorePixelRatio||
		 context.mozBackingStorePixelRatio||
		 context.msBackingStorePixelRatio||
		 context.oBackingStroePixelRatio||
		 context.backingStroePixelRatio||1,
	 ratio = divicePixelRatio/backingStoreRatio;
	 
	 //ensure wo hae a value set for auto.
	 //if auto is set to false then we will simply 
	 //not upscale the canvas
	 //and the default behaviour will be maintained
	 if(!!auto){
		 auto = true;
	 }
	 //upscale the canvas if the two ratios don't match
	 if(auto && devicePixelRatio !== backingStroeRatio){
		 var oldWidth = canvas.width;
		 var oldHeight = canvas.height;
		 
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
 }
 function getCtx(id,type){
	 var canvas = document.getElementById(id);
	 return (canvas?canvas.getContext(type):false);
 }
 zhl.fn.scaleCanvasWithRatio = scaleCanvasWithRatio;
 zhl.fn.getCtx = getCtx;