/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */

/**
 * @license almond 0.3.1 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */
var requirejs, require, define;

(function(undef) {
    var main, req, makeMap, handlers, defined = {}, waiting = {}, config = {}, defining = {}, hasOwn = Object.prototype.hasOwnProperty, aps = [].slice, jsSuffixRegExp = /\.js$/;
    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }
    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex, foundI, foundStarMap, starI, i, j, part, baseParts = baseName && baseName.split("/"), map = config.map, starMap = map && map["*"] || {};
        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                name = name.split("/");
                lastIndex = name.length - 1;
                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, "");
                }
                //Lop off the last part of baseParts, so that . matches the
                //"directory" and not name of the baseName's module. For instance,
                //baseName of "one/two/three", maps to "one/two/three.js", but we
                //want the directory, "one/two" for this normalization.
                name = baseParts.slice(0, baseParts.length - 1).concat(name);
                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === ".." || name[0] === "..")) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots
                name = name.join("/");
            } else if (name.indexOf("./") === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }
        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split("/");
            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");
                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join("/")];
                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }
                if (foundMap) {
                    break;
                }
                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }
            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }
            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join("/");
            }
        }
        return name;
    }
    function makeRequire(relName, forceSync) {
        return function() {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);
            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== "string" && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([ relName, forceSync ]));
        };
    }
    function makeNormalize(relName) {
        return function(name) {
            return normalize(name, relName);
        };
    }
    function makeLoad(depName) {
        return function(value) {
            defined[depName] = value;
        };
    }
    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }
        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error("No " + name);
        }
        return defined[name];
    }
    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix, index = name ? name.indexOf("!") : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [ prefix, name ];
    }
    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function(name, relName) {
        var plugin, parts = splitPrefix(name), prefix = parts[0];
        name = parts[1];
        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }
        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }
        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + "!" + name : name,
            //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };
    function makeConfig(name) {
        return function() {
            return config && config.config && config.config[name] || {};
        };
    }
    handlers = {
        require: function(name) {
            return makeRequire(name);
        },
        exports: function(name) {
            var e = defined[name];
            if (typeof e !== "undefined") {
                return e;
            } else {
                return defined[name] = {};
            }
        },
        module: function(name) {
            return {
                id: name,
                uri: "",
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };
    main = function(name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, args = [], callbackType = typeof callback, usingExports;
        //Use name if no relName
        relName = relName || name;
        //Call the callback to define the module, if necessary.
        if (callbackType === "undefined" || callbackType === "function") {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? [ "require", "exports", "module" ] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;
                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) || hasProp(waiting, depName) || hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + " missing " + depName);
                }
            }
            ret = callback ? callback.apply(defined[name], args) : undefined;
            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef && cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };
    requirejs = require = req = function(deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }
        //Support require(['a'])
        callback = callback || function() {};
        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === "function") {
            relName = forceSync;
            forceSync = alt;
        }
        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function() {
                main(undef, deps, callback, relName);
            }, 4);
        }
        return req;
    };
    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function(cfg) {
        return req(cfg);
    };
    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;
    define = function(name, deps, callback) {
        if (typeof name !== "string") {
            throw new Error("See almond README: incorrect module build, no module name");
        }
        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }
        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [ name, deps, callback ];
        }
    };
    define.amd = {
        jQuery: true
    };
})();

define("almond", function() {});

define("zhl", [], function() {
    window.zhl = {};
    window.zhl.viewModels = {};
    //window.zhl.managers = {};
    //window.zhl.controllers = {};
    return window.zhl;
});

define("tool", [], function() {
    var Tool = {
        //canvas设置
        scaleCanvas: scaleCanvasWithRatio,
        //使用fragment为网页添加新节点
        appendToPage: appendToPage,
        //判断是否是数组
        isArray: isArray,
        isNull: isNull
    };
    //获取宽度
    //http://www.quirksmode.org/dom/w3c_cssom.html#screenview
    function getWidth(media) {
        var result;
        switch (media) {
          case "brower":
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

          default:        }
        return result;
    }
    function isNull(value) {
        if (value == null) {
            throw "specific can not be null";
        }
        return value;
    }
    function appendToPage(container, children) {
        if (!container) {
            throw "a container is required!";
        }
        var fragment = document.createDocumentFragment();
        if (isArray(children)) {
            children.foreach(function(item) {
                fragment.appendChild(item);
            });
        } else {
            fragment.appendChild(children);
        }
        container.appendChild(fragment);
        fragment = null;
        return container;
    }
    function isArray(obj) {
        return typeof obj == "object" && obj instanceof Array;
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
    function scaleCanvasWithRatio(_canvas, flag) {
        if (!_canvas) {
            throw "A canvas is required";
        }
        //get the canvas and context
        var canvas = _canvas, context = canvas.getContext("2d"), auto;
        //finally query the various pixel ratios
        devicePixelRatio = window.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStroePixelRatio || context.backingStroePixelRatio || 1, 
        ratio = devicePixelRatio / backingStoreRatio;
        //ensure wo hae a value set for auto.
        //if auto is set to false then we will simply 
        //not upscale the canvas
        //and the default behaviour will be maintained
        if (typeof flag === "undefined") {
            auto = true;
        }
        //upscale the canvas if the two ratios don't match
        if (auto) {
            var oldWidth = window.innerWidth;
            var oldHeight = window.innerHeight;
            //scale width && height with ratio
            //this means (ratio*ratio) times the amount 
            //of memory is required to service your 
            //canvas element
            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;
            canvas.style.width = oldWidth + "px";
            canvas.style.height = oldHeight + "px";
            //now scale the content to encouter
            //the face that we've manully scaled
            //our canvas element
            context.scale(ratio, ratio);
        }
        return canvas;
    }
    return Tool;
});

define("rain", [ "tool" ], function(Tools) {
    function rain(canvasId) {
        const SENTENCE_WIDTH = 20;
        const HEAD_HEIGHT = 40;
        const FOOTER_HEIGHT = 60;
        const FONT_COLOR = "rgba(35,255,35,.8)";
        const EXTEND_AWAY = "preface-hidden";
        var self = this;
        var canvas, ctx, sentenceNum, sentenceArr, startId;
        this.startRain = startRain;
        this.removeCanvas = removeCanvas;
        //通过id获取canvas元素
        canvas = getCanvas(canvasId || "");
        canvas = Tools.scaleCanvas(canvas);
        ctx = canvas.getContext("2d");
        //设置画笔颜色
        ctx.fillStyle = FONT_COLOR;
        //计算屏幕中下落的段落的列数
        sentenceNum = calculateIndex();
        //生成由于绘制段落的数组，
        //该数组的元素为段落的一个实例
        sentenceArr = generateData(sentenceNum);
        //获取canvas
        function getCanvas(id) {
            var canvas = document.getElementById(id);
            if (!canvas) {
                throw "Canvas is not found!";
            }
            return canvas;
        }
        //获取屏幕宽度，计算大概的纵向条目
        // return int
        function calculateIndex() {
            return Math.round(canvas.width / SENTENCE_WIDTH);
        }
        //生成一个段落的实例
        //包括开始位置，结束位置，字体大小
        //return object
        function createSentence(index) {
            return {
                size: ~~((Math.random() - .5) * 20 + 10),
                srcy: ~~(canvas.height * Math.random() * .8),
                desy: 0,
                xPos: index * SENTENCE_WIDTH,
                db: 4
            };
        }
        //生成用于绘制的数组
        //return array
        function generateData(num) {
            var arr = [], i = 0;
            for (;i < num; i++) {
                arr[i] = createSentence(i);
            }
            return arr;
        }
        //根据生成的array 绘制
        function draw() {
            //绘制黑色透明背景
            ctx.fillStyle = "rgba(0,0,0,.05)";
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight - FOOTER_HEIGHT);
            //绘制页脚白色透明背景
            ctx.fillStyle = "rgba(255,255,255,.08)";
            ctx.fillRect(0, window.innerHeight - FOOTER_HEIGHT, window.innerWidth, FOOTER_HEIGHT);
            //绘制段落
            ctx.fillStyle = FONT_COLOR;
            //遍历段落数组
            /*
			注：这里借鉴了网友的代码	http://zhidao.baidu.com/link?url=fpG_0yICynFlAiOxDAeppeLdcJqRxHk1SkYYlOgFITVKCRFIuN3fqAenNDd8J4MshxGcqpRhhC3wmaQhXjo4Vq1kKbTXAZWmob5J0c00FMy
			*/
            sentenceArr.map(function(value, index) {
                //计算到达底部距离
                var dist = value.srcy - (window.innerHeight - value.desy);
                //到达底部
                if (dist <= 0) {
                    //
                    if (value.db < 2) {
                        //不绘制新的字符，
                        //只将旧的字符下移1px
                        //制作拖影效果
                        ctx.font = "bold " + value.size + "px serif";
                        ctx.fillText(value.text, value.xPos, value.srcy);
                        value.db++;
                    } else {
                        //绘制新的字符
                        //随机生成Unicode编码，获取日文字符
                        value.text = String.fromCharCode(12448 + Math.round(95 * Math.random()));
                        //设置字体
                        ctx.font = "bold " + value.size + "px serif";
                        //绘制
                        ctx.fillText(value.text, value.xPos, value.srcy);
                        //设置重叠字段
                        //当value的db<2时，value.text值不变，只是向下移动1px,模拟出拖影效果
                        value.db = 0;
                    }
                }
                //生成新的段落
                //增加的随机数用于延时作用，
                if (dist > ~~Math.random() * 1e4) {
                    sentenceArr[index] = createSentence(index);
                }
                //设置y的偏移量
                if (value.db < 2) {
                    value.srcy++;
                } else {
                    value.srcy += value.size;
                }
            });
        }
        //开始
        function startRain() {
            return startId = setInterval(draw, 30);
        }
        //清空canvas
        function clear(canvas) {}
        //结束
        function end(timeId) {
            clearInterval(timeId);
            start = null;
            canvas.style.display = "none";
        }
        //remove
        function removeCanvas(callback) {
            canvas.setAttribute("class", EXTEND_AWAY);
            setTimeout(function() {
                end(startId);
                callback();
            }, 3500);
        }
    }
    return rain;
});

define("logo", [ "tool" ], function(Tools) {
    function logo(containerId) {
        const MAX_WIDTH = "50rem";
        const PREVIOUS_CLASS = "container";
        const MOVE_CLASS = "move";
        const STOP_CLASS = "stop";
        const EXTEND_AWAY = "extendAway";
        var el, content, logo;
        logo = document.getElementById(containerId);
        content = getString("THE MATRIX");
        el = initElement(content);
        //el = initElement();
        Tools.appendToPage(logo, el);
        function initElement(content) {
            var el = create("div");
            el.setAttribute("class", PREVIOUS_CLASS);
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
        function getString(string) {
            var arr = string.split("");
            return arr.map(function(char, index) {
                return "<span class='char char" + index + "'>" + char + "</span>";
            }).join("");
        }
        function create(tagName) {
            return document.createElement(tagName);
        }
        function append(sup, sub) {
            sup.appendChild(sub);
        }
        function move(el) {
            var previous = el.getAttribute("class");
            el.setAttribute("class", PREVIOUS_CLASS + " " + MOVE_CLASS);
        }
        function stop(el) {
            el.setAttribute("class", PREVIOUS_CLASS + " " + STOP_CLASS);
        }
        function extendAway(callback) {
            el.setAttribute("class", PREVIOUS_CLASS + " " + MOVE_CLASS + " " + EXTEND_AWAY);
            remove(callback);
        }
        function remove(callback) {
            setTimeout(function() {
                logo.style.display = "none";
                callback();
            }, 3500);
        }
        return {
            moveLight: function() {
                move(el);
            },
            stopLight: function() {
                stop(el);
            },
            extendAway: extendAway
        };
    }
    return logo;
});

define("porfacePortrait", [ "tool" ], function(Tools) {
    function Portrait() {
        var Api = {
            el: Tools.isNull(document.getElementById("preface-portrait")),
            removePortrait: removePortrait,
            addListener: addListener
        };
        function hiddenPortrait() {
            Api.el.style.opacity = 0;
        }
        function removePortrait() {
            Api.el.style.display = "none";
        }
        function addListener(callback) {
            var el = document.getElementById("escape-btn");
            el = Tools.isNull(el);
            el.addEventListener("click", function onEscapeBtn() {
                hiddenPortrait();
                //main.js::onEscape
                callback();
            });
        }
        return Api;
    }
    return Portrait;
});

define("charPhoto", [ "tool" ], function(Tools) {
    function CharPhoto(canvasId) {
        const FOOTER_HEIGHT = 60;
        const CANVAS_WIDTH = window.innerWidth;
        const CANVAS_HEIGHT = window.innerHeight - FOOTER_HEIGHT;
        const DELTA_TIME = 30;
        const IMG_HEIGHT = 814;
        const FONT_COLOR = "rgba(35,255,35,0.8)";
        const END_WORD = "   网络无限宽广";
        var srcx, startx, starty = 20, srcy = starty, deltax = 6, deltay = 12, canvas, ctx, img = new Image(), url = "web/images/preface-portrait-s.png";
        img.src = url;
        //获取canvas
        canvas = Tools.isNull(document.getElementById(canvasId));
        ctx = canvas.getContext("2d");
        canvas = initCanvas();
        canvas = setCanvasVisible(true);
        img.onload = init;
        function init() {
            var width, height, imgData, charArray, ratio, timeId = null;
            //计算scale比列，让图片适应屏幕
            ratio = getImgRatio();
            //ratio = 1;
            width = ~~(img.width * ratio);
            height = ~~(img.height * ratio);
            img.width = width;
            img.height = height;
            srcx = startx = (window.innerWidth - width) / 2;
            //获取图片像素信息
            imgData = getPixelData(ctx, img, ratio);
            console.log("imgData" + imgData.data.length);
            //将像素信息转化成字符数组
            charArray = getCharMap(imgData.data, width, height);
            imgData = null;
            //清空画布
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            //显示画布
            canvas = setCanvasVisible(true);
            //设置字体、颜色
            setFontStyle("normal 12px serif", FONT_COLOR);
            ctx.scale(1, 1);
            //开始输出到canvas
            if (!timeId) {
                timeId = setInterval(function() {
                    var char = getChar(charArray);
                    if (char) {
                        draw(char);
                    } else {
                        //结束语
                        ctx = printText(ctx, END_WORD, "center", window.innerWidth / 2, srcy + 12);
                        clearInterval(timeId);
                        timeId = null;
                    }
                }, DELTA_TIME);
            }
        }
        function getChar(array) {
            var char = array.shift();
            if (!char) {
                return false;
            }
            if (char == "_") {
                srcx += deltax;
                return getChar(array);
            } else {
                return char;
            }
        }
        function getImgRatio() {
            var properHeight = window.innerHeight - starty * 2 - 10;
            var ratio;
            properHeight = Math.min(IMG_HEIGHT, properHeight);
            ratio = +(properHeight / IMG_HEIGHT).toFixed(2);
            return ratio;
        }
        function printText(ctx, word, align, posx, posy) {
            ctx.textAlign = align || "center";
            ctx.fillText(word, posx, posy);
            return ctx;
        }
        function getPixelData(ctx, img, ratio) {
            //scale img for proper size
            ctx.scale(ratio, ratio);
            ctx.drawImage(img, 0, 0);
            return ctx.getImageData(0, 0, img.width, img.height);
        }
        function getCharMap(imgDataArr, width, height) {
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
                charArray.push("=");
            }
            return charArray;
        }
        function setCanvasVisible(tag) {
            canvas.style.display = tag ? "block" : "none";
            return canvas;
        }
        function initCanvas() {
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
            canvas.style.width = CANVAS_WIDTH + "px";
            canvas.style.height = CANVAS_HEIGHT + "px";
            return canvas;
        }
        function setFontStyle(font, color) {
            ctx.fillStyle = color;
            ctx.font = font;
            return ctx;
        }
        //draw
        function draw(char) {
            //是否换行
            if (char == "=") {
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
                ctx.fillStyle = "rgba(35,255,35," + char + ")";
                ctx.fillRect(srcx + deltax, srcy - deltay, 4, 10);
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
            return .299 * r + .578 * g + .114 * b;
        }
        // 根据灰度生成相应字符：反转映射
        function toTextRevert(g) {
            if (g <= 30) {
                return "_";
            } else if (g > 30 && g <= 60) {
                return ":";
            } else if (g > 60 && g <= 120) {
                return "l";
            } else if (g > 120 && g <= 150) {
                return "o";
            } else if (g > 150 && g <= 180) {
                return "x";
            } else if (g > 180 && g <= 210) {
                return "a";
            } else if (g > 210 && g <= 240) {
                return "m";
            } else {
                return "#";
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
            g += 20;
            if (g <= 240) {
                return (g / 255).toFixed(2);
            } else {
                return "_";
            }
        }
    }
    return CharPhoto;
});

require([ "zhl", "rain", "tool", "logo", "porfacePortrait", "charPhoto" ], function() {
    var zhl = require("zhl"), Rain = require("rain"), Logo = require("logo"), Tools = require("tool"), Portrait = require("porfacePortrait"), CharPhoto = require("charPhoto");
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
    zhl.charPhoto = CharPhoto("preface");
    //显示公告
    function showCaution() {
        var caution = document.getElementById("caution");
        if (caution) {
            caution.style.opacity = 1;
        }
    }
    function deleteProperty(Obj) {
        Obj = null;
        delete Obj;
    }
});

define("main", function() {});