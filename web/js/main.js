/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

var requirejs,require,define;!function(n){function e(n,e){return v.call(n,e)}function t(n,e){var t,i,r,o,u,a,c,f,l,s,d,p=e&&e.split("/"),g=h.map,m=g&&g["*"]||{};if(n&&"."===n.charAt(0))if(e){for(n=n.split("/"),u=n.length-1,h.nodeIdCompat&&y.test(n[u])&&(n[u]=n[u].replace(y,"")),n=p.slice(0,p.length-1).concat(n),l=0;l<n.length;l+=1)if(d=n[l],"."===d)n.splice(l,1),l-=1;else if(".."===d){if(1===l&&(".."===n[2]||".."===n[0]))break;l>0&&(n.splice(l-1,2),l-=2)}n=n.join("/")}else 0===n.indexOf("./")&&(n=n.substring(2));if((p||m)&&g){for(t=n.split("/"),l=t.length;l>0;l-=1){if(i=t.slice(0,l).join("/"),p)for(s=p.length;s>0;s-=1)if(r=g[p.slice(0,s).join("/")],r&&(r=r[i])){o=r,a=l;break}if(o)break;!c&&m&&m[i]&&(c=m[i],f=l)}!o&&c&&(o=c,a=f),o&&(t.splice(0,a,o),n=t.join("/"))}return n}function i(e,t){return function(){var i=w.call(arguments,0);return"string"!=typeof i[0]&&1===i.length&&i.push(null),l.apply(n,i.concat([e,t]))}}function r(n){return function(e){return t(e,n)}}function o(n){return function(e){p[n]=e}}function u(t){if(e(g,t)){var i=g[t];delete g[t],m[t]=!0,f.apply(n,i)}if(!e(p,t)&&!e(m,t))throw new Error("No "+t);return p[t]}function a(n){var e,t=n?n.indexOf("!"):-1;return t>-1&&(e=n.substring(0,t),n=n.substring(t+1,n.length)),[e,n]}function c(n){return function(){return h&&h.config&&h.config[n]||{}}}var f,l,s,d,p={},g={},h={},m={},v=Object.prototype.hasOwnProperty,w=[].slice,y=/\.js$/;s=function(n,e){var i,o=a(n),c=o[0];return n=o[1],c&&(c=t(c,e),i=u(c)),c?n=i&&i.normalize?i.normalize(n,r(e)):t(n,e):(n=t(n,e),o=a(n),c=o[0],n=o[1],c&&(i=u(c))),{f:c?c+"!"+n:n,n:n,pr:c,p:i}},d={require:function(n){return i(n)},exports:function(n){var e=p[n];return"undefined"!=typeof e?e:p[n]={}},module:function(n){return{id:n,uri:"",exports:p[n],config:c(n)}}},f=function(t,r,a,c){var f,l,h,v,w,y,x=[],b=typeof a;if(c=c||t,"undefined"===b||"function"===b){for(r=!r.length&&a.length?["require","exports","module"]:r,w=0;w<r.length;w+=1)if(v=s(r[w],c),l=v.f,"require"===l)x[w]=d.require(t);else if("exports"===l)x[w]=d.exports(t),y=!0;else if("module"===l)f=x[w]=d.module(t);else if(e(p,l)||e(g,l)||e(m,l))x[w]=u(l);else{if(!v.p)throw new Error(t+" missing "+l);v.p.load(v.n,i(c,!0),o(l),{}),x[w]=p[l]}h=a?a.apply(p[t],x):void 0,t&&(f&&f.exports!==n&&f.exports!==p[t]?p[t]=f.exports:h===n&&y||(p[t]=h))}else t&&(p[t]=a)},requirejs=require=l=function(e,t,i,r,o){if("string"==typeof e)return d[e]?d[e](t):u(s(e,t).f);if(!e.splice){if(h=e,h.deps&&l(h.deps,h.callback),!t)return;t.splice?(e=t,t=i,i=null):e=n}return t=t||function(){},"function"==typeof i&&(i=r,r=o),r?f(n,e,t,i):setTimeout(function(){f(n,e,t,i)},4),l},l.config=function(n){return l(n)},requirejs._defined=p,define=function(n,t,i){if("string"!=typeof n)throw new Error("See almond README: incorrect module build, no module name");t.splice||(i=t,t=[]),e(p,n)||e(g,n)||(g[n]=[n,t,i])},define.amd={jQuery:!0}}(),define("almond",function(){}),define("zhl",[],function(){return window.zhl={},window.zhl.viewModels={},window.zhl}),define("tool",[],function(){function n(n,t){if(!n)throw"a container is required!";var i=document.createDocumentFragment();return e(t)?t.foreach(function(n){i.appendChild(n)}):i.appendChild(t),n.appendChild(i),i=null,n}function e(n){return"object"==typeof n&&n instanceof Array}function t(n,e){if(!n)throw"A canvas is required";var t,i=n,r=i.getContext("2d");if(devicePixelRatio=window.devicePixelRatio||1,backingStoreRatio=r.webkitBackingStorePixelRatio||r.mozBackingStorePixelRatio||r.msBackingStorePixelRatio||r.oBackingStroePixelRatio||r.backingStroePixelRatio||1,ratio=devicePixelRatio/backingStoreRatio,"undefined"==typeof e&&(t=!0),t){var o=window.innerWidth,u=window.innerHeight;i.width=o*ratio,i.height=u*ratio,i.style.width=o+"px",i.style.height=u+"px",r.scale(ratio,ratio)}return i}var i={scaleCanvas:t,appendToPage:n,isArray:e};return i}),define("rain",["tool"],function(n){function e(e){function t(n){var e=document.getElementById(n);if(!e)throw"Canvas is not found!";return e}function i(){return Math.round(g.width/l)}function r(n){return{size:~~(20*(Math.random()-.5)+10),srcy:~~(g.height*Math.random()*.8),desy:0,xPos:n*l,db:4}}function o(n){for(var e=[],t=0;n>t;t++)e[t]=r(t);return e}function u(){h.fillStyle="rgba(0,0,0,.05)",h.fillRect(0,0,window.innerWidth,window.innerHeight-s),h.fillStyle="rgba(255,255,255,.08)",h.fillRect(0,window.innerHeight-s,window.innerWidth,s),h.fillStyle=d,v.map(function(n,e){var t=n.srcy-(window.innerHeight-n.desy);0>=t&&(n.db<2?(h.font="bold "+n.size+"px serif",h.fillText(n.text,n.xPos,n.srcy),n.db++):(n.text=String.fromCharCode(12448+Math.round(95*Math.random())),h.font="bold "+n.size+"px serif",h.fillText(n.text,n.xPos,n.srcy),n.db=0)),t>1e4*~~Math.random()&&(v[e]=r(e)),n.db<2?n.srcy++:n.srcy+=n.size})}function a(){return w=setInterval(u,30)}function c(n){clearInterval(n),start=null,g.style.display="none"}function f(n){g.setAttribute("class",p),setTimeout(function(){c(w),n()},3500)}const l=20,s=50,d="rgba(35,255,35,.8)",p="preface-hidden";var g,h,m,v,w;this.startRain=a,this.removeCanvas=f,g=t(e||""),g=n.scaleCanvas(g),h=g.getContext("2d"),h.fillStyle=d,m=i(),v=o(m)}return e}),define("logo",["tool"],function(n){function e(e){function t(n){var e=r("div");return e.setAttribute("class",f),e.innerHTML=n,e}function i(n){var e=n.split("");return e.map(function(n,e){return"<span class='char char"+e+"'>"+n+"</span>"}).join("")}function r(n){return document.createElement(n)}function o(n){n.getAttribute("class");n.setAttribute("class","container move")}function u(n){n.setAttribute("class","container stop")}function a(n){l.setAttribute("class","container move extendAway"),c(n)}function c(n){setTimeout(function(){d.style.display="none",n()},3500)}const f="container";var l,s,d;return d=document.getElementById(e),s=i("THE MATRIX"),l=t(s),n.appendToPage(d,l),{moveLight:function(){o(l)},stopLight:function(){u(l)},extendAway:a}}return e}),require(["zhl","rain","tool","logo"],function(){var n=require("zhl"),e=require("rain");Logo=require("logo"),n.rain=new e("preface"),n.logo=Logo("logo");n.rain.startRain();setTimeout(function(){n.logo.moveLight(),setTimeout(function(){n.rain.removeCanvas(function(){n.rain=null}),n.logo.extendAway(function(){n.logo=null})},2800)},5e3)}),define("main",function(){});