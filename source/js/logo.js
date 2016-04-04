define(['tool'],function(Tools){
	function logo(containerId){
		const MAX_WIDTH = '50rem';
		const PREVIOUS_CLASS = "container";
		const MOVE_CLASS = "move";
		const STOP_CLASS = "stop";
		const EXTEND_AWAY = "extendAway";
		var el,content,logo;
		logo = document.getElementById(containerId);
		content = getString("THE MATRIX");
		el = initElement(content);
		//el = initElement();
		
		Tools.appendToPage(logo,el);
		
		function initElement(content){
			var el = create("div");
			el.setAttribute("class",PREVIOUS_CLASS);
			el.innerHTML = content;
			return el;
		}
		// function initElementVer1(){
			// var el = create("div");
			// el.setAttribute("class",PREVIOUS_CLASS);
			// var front = create("p");
			// front.setAttribute("class","front");
			// front.innerText = "THE MATRIX";
			// var snippet = create("dev");
			// var p = create("p");
			// snippet.setAttribute("class","snippet");
			// p.setAttribute("class","under");
			// p.innerText = "THE MATRIX";
			// append(snippet,p);
			// append(el,front);
			// append(el,snippet);
			// return el;
		// }
		function getString(string){
			var arr = string.split('');
			return arr.map(function(char,index){
				return "<span class='char char"+ index+"'>" + char + "</span>";
			}).join("");
		}
		
		function create(tagName){
			return document.createElement(tagName);
		}

		function append(sup,sub){
			sup.appendChild(sub);
		}
		function move(el){
			var previous = el.getAttribute("class");
			el.setAttribute("class",PREVIOUS_CLASS +  " " + MOVE_CLASS);
		}
		function stop(el){
			el.setAttribute("class",PREVIOUS_CLASS + " " + STOP_CLASS);
		}
		function extendAway(callback){
			el.setAttribute("class",PREVIOUS_CLASS + " " + MOVE_CLASS + " " + EXTEND_AWAY);
			remove(callback);
		}
		function remove(callback){
			setTimeout(function(){
				logo.style.display  = "none";
				callback();
			},3500);
		}
		return {
			moveLight: function(){
				move(el);
			},
			stopLight: function(){
				stop(el);
			},
			extendAway: extendAway
		};
	}
	return logo;
});