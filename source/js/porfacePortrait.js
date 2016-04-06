define(['tool'],function(Tools){
		function Portrait(){
			var Api= {
				el: Tools.isNull(document.getElementById('preface-portrait')),
				removePortrait: removePortrait,
				addListener: addListener
			};
			function hiddenPortrait(){
				Api.el.style.opacity = 0;
			}
			function removePortrait(){
				Api.el.style.display = 'none';	
			}
			function addListener(callback){
				var el = document.getElementById("escape-btn");
				el = Tools.isNull(el);
				el.addEventListener('click',function onEscapeBtn(){
					hiddenPortrait();
					//main.js::onEscape
					callback();
				});
			}
			return Api;
		}
		return Portrait;
});