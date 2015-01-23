var initInfo = {
    pages: [
        "MapManager.html",
        "dashboard.html",
        "resources_mng.html",
        "users_mng.html",
        "AgencyAdmin.html",
        "TripPlanner.html",
        "Schedule.html",
        "AlertsTab.html",
        "resource_developer.html",
        "operations.html"
    ],
    scripts: [
        "jquery-ui-1.10.0.custom.js",
        "jquery.ui.timepicker.js",
        "highcharts.js",
        "jquery.tablesorter.js",
        "functions.js",
        "ajaxRequest.js",
        "gridslib.js",
        "chartsLib.js",
        //"jsoneditor-min.js",
        "json2.js",
        "jsonlint.js",
        "navigation.js",
        "jquery.placeholder.min.js",
        "dashboard.js",
        "jquery.bpopup.min.js",
        "leaflet.src.js",
        "L.CircleEditor.js",
        "MapManager.js",
        "resources_mng.js",
        "jquery.blockUI.js",
        "users_mng.js",
        "AlertsRequests.js",
        "ticketing.js",
        "TripPlannerMap.js",
        "TripPlannerSearchForm.js",
        "TripPlannerRunSearch.js",
        "TripPlannerRoute.js",
        "TripPlannerOld.js",
        "TripPlannerMain.js",
        "AgencyAdmin.js",
        "Schedule.js",
        "ScheduleOld.js",
        "agencyData.js",
        "AlertsTab.js",
        "ratingReviews.js",
        "resource_developer.js",
        "operations.js",
    ],
    resources: [],
    current: 0,
    load: function () {
        $.ajax({
            dataType: "json",
            url: "serverlist.txt",
            data: null,
            success: function (data) {
                for (var i = 0; i < data.mappings.length; ++i) {
                    switch(data.mappings[i].serverType) {
                        case 0:
                            initInfo.appServer = data.mappings[i].address;
                            break;
                        case 1:
                            initInfo.reportsServer = data.mappings[i].address;
                            break;
                        case 2:
                            initInfo.mapsServer = data.mappings[i].address;
                            break;
                        case 3:
                            initInfo.autoCompleteServer = data.mappings[i].address;
                            break;
                        case 4:
                            initInfo.adminAppServer = data.mappings[i].address;
                            break;
                        case 5:
                            initInfo.tripPlanImages = data.mappings[i].address;
                    }
                }
                if (initInfo.appServer && initInfo.reportsServer && initInfo.mapsServer && initInfo.autoCompleteServer && initInfo.adminAppServer) {
                    initInfo.loadConfig();
                }
                else {
                    $("#appLoadingBox").remove();
                    $("#appLoading").append($("<div style='color:black;background: deeppink;border: 1px solid red' />").text("Missing server data"));
                }
            },
            error: function (xhr) {
                $("#appLoadingBox").remove();
                $("#appLoading").append($("<div style='color:black;background: deeppink;border: 1px solid red' />").text("Missing server file:"+xhr.responseText));
            }
        });
    },
    loadConfig: function () {
        var customerId = 1;
        var cMetroId = initInfo.getCookie("metroId");
        if (!cMetroId) cMetroId = 1;
        var cLangId = initInfo.getCookie("langId");
        if (!cLangId) cLangId = 41;
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query = window.location.search.substring(1);

        var urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
        if (urlParams.langId) {
            cLangId = urlParams.langId;
            initInfo.setCookie("forceLangId",cLangId);
        }
        if (urlParams.metroAreaId) {
            cMetroId = urlParams.metroAreaId;
            initInfo.setCookie("forceMetroId",cMetroId);
        }
        if(urlParams.customerId){
            customerId = urlParams.customerId;
        }
        if (urlParams.countryId) {
            userCountry = urlParams.countryId;
        }
        if (targetLogoLink[customerId] && targetLogoLink[customerId][cMetroId] != "") {
            $(".toolBarDownloadLink").each(function () {
                $(this).attr("href", targetLogoLink[customerId][cMetroId]);
            });
        }
        //define headers for initiliazation
        var userIdInHeader = {};
        var userIdPostLogin = initInfo.getCookie("userId");
        if (userIdPostLogin != "0" && userIdPostLogin) {
            userIdInHeader.user_id = userIdPostLogin;
        }
        userIdInHeader.client_version = '3.0.0.1';
        $.ajax({
            dataType: "json",
            url: "/services-app/services/Users/GetConfigForMetroAndLang?metroAreaId=" + encodeURIComponent(cMetroId) +
                "&langId=" + encodeURIComponent(cLangId) +
                "&customerId=" + encodeURIComponent(customerId),
            data: null,
            headers:userIdInHeader,
            success: function (data) {
                userId = data.userId;
                langId = cLangId;
                metroAreaId = data.clientInit.metroAreaId;
                agencies = data.clientInit.agencies.agencies;
                languageList = data.clientInit.languages.languageList;
                //translationLanguages = data.translationLanguages;
                metroAreaList = data.clientInit.metroAreas.metroAreaList.sort(function (a, b) {
                        if (a.areaName > b.areaName) return 1;
                        else if (a.areaName < b.areaName) return -1;
                        else return 0
                    });
                formTransitTypes = data.clientInit.metroRouteTypes.formTransitTypes;
                socialLinks = data.clientInit.socialLinks.socialLinkList;
                initInfo.customerFeatures = data.customerFeatures || [];
                countryList = data.countryList;
                notificationSettingSubjects = data.notificationSettingSubjects;
                try{
                    initInfo.resources = JSON.parse(data.languageResourceFile.clob.replace('\"','"').replace(/\t/g," "));
                } catch(x) {
                    alert("Can't load string resources");
                }
                if (langId == 62) {
                    $("body").addClass("rtl");
                }
                $("#appLoadingBox .title").text(loc("LoadingWeb", $("#appLoadingBox .title").text()));
                if (initInfo.customerFeatures) {
                    if (initInfo.customerFeatures.indexOf("NoHeader") == -1) $("body").removeClass("Feature_NoHeader");
                    if (initInfo.customerFeatures.indexOf("NoLogin") == -1) $("body").removeClass("Feature_NoLogin");
                    for (var i = 0; i < initInfo.customerFeatures.length; ++i) {
                        if(initInfo.customerFeatures[i][0] != '/' ){
                            $("body").addClass( "Feature_" + initInfo.customerFeatures[i] );
                        }
                    }
                }
                initInfo.loadPages();
            },
            error:function(xhr){
                $("#appLoadingBox").remove();
                $("#appLoading").append($("<div style='color:black;background: deeppink;border: 1px solid red' />").text(xhr.responseText));
            }
        });
    },
    loadPages: function () {
        console.log(initInfo.pages[initInfo.current]);
        var loadingPercent = (initInfo.current) * 100 / (initInfo.pages.length + initInfo.scripts.length);
        $("#loadingProgressInner").css("width", loadingPercent + "%");
        $.get(initInfo.pages[initInfo.current], null, function (data) {
            $("#appPages").append($("<div class='appPageContainer'/>").html(data));
            ++initInfo.current;
            if (initInfo.current >= initInfo.pages.length) {
                initInfo.current = 0;
                initInfo.loadScripts();
            } else {
                initInfo.loadPages();
            }
        });
        
    },
    loadScripts: function () {
        console.log(initInfo.scripts[initInfo.current]);
        var loadingPercent = (initInfo.pages.length + initInfo.current) * 100 / (initInfo.pages.length + initInfo.scripts.length);
        $("#loadingProgressInner").css("width", loadingPercent + "%");
        //bypass jQuery becaue if we use jQuery we get a really bad debug experiance
        initInfo.loadJs("js/" + initInfo.scripts[initInfo.current], function () {
            ++initInfo.current;
            if (initInfo.current >= initInfo.scripts.length) {
                if (navigator.userAgent.indexOf("MSIE 8.0") > 0) {
                    setTimeout(function () { initInfo.startUi(); }, 2000);
                }
                else {
                    initInfo.startUi();
                }
            } else {
                initInfo.loadScripts();
            }
        });
        
    },
    startUi: function () {
        initInfo.startUi = function () { }; // IE can cause this to be called multiple times
        $("#appLoading").hide();
        $("#appPages").show();

        if (initInfo.finishInit) initInfo.finishInit();
    },
    changeMetroArea: function (newAreaId, langId) {
        initInfo.setCookie("metroId", newAreaId);
        initInfo.setCookie("forceMetroId", newAreaId);
        if (langId != undefined) {
            initInfo.setCookie("langId", langId);
            initInfo.setCookie("forceLangId", langId);
        }
        initInfo.reload();
    },
    changeLanguage: function (newLangId, areaId){
        initInfo.setCookie("langId", newLangId);
        initInfo.setCookie("forceLangId", newLangId);
        if (areaId) {
            initInfo.setCookie("metroId", areaId);
            initInfo.setCookie("forceMetroId", areaId);
        }
        initInfo.reload();
    },
    getCookie: function(c_name)
    {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1)
        {
            c_start = c_value.indexOf(c_name + "=");
        }
        if (c_start == -1)
        {
            c_value = null;
        }
        else
        {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
            if (c_end == -1)
            {
                c_end = c_value.length;
            }
            c_value = unescape(c_value.substring(c_start,c_end));
        }
        return c_value;
    },
    setCookie: function (name, value) {
        var date = new Date();
        date.setTime(date.getTime() + (90 * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
        document.cookie = name + "=" + escape(value) + expires;
    },
    loadJs: function (filename,callback){
        var fileref = document.createElement('script');
        // IE
        fileref.onreadystatechange = function () {
            if (fileref.readyState === 'complete' || (navigator.userAgent.indexOf("MSIE 8.0")>0 && fileref.readyState === 'loaded')) {
                fileref.onreadystatechange = null;
                callback();
            }
        };
        // others
        fileref.onload = function () {
            callback();
        };
        fileref.setAttribute("type", "text/javascript");
        fileref.setAttribute("src", filename);
        document.getElementsByTagName("head")[0].appendChild(fileref);
    },
    reload: function () {
        var url = window.location.toString();
        var qStart = url.indexOf("?");
        if (qStart > 0) { // remove url paramters that can block us from changing metro or languge
            url = url.substring(0, qStart);

            var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            query = window.location.search.substring(1);

            var newQuery = "";
            while (match = search.exec(query))
                if (match[1] != "metroAreaId" && match[1] != "langId")
                    newQuery += match[1] + "=" + match[2] + "&";
            if (newQuery.length) newQuery = "?" + newQuery.substr(0, newQuery.length - 1);

            url += newQuery;
            if(url != window.location.href)
                window.location = url;
            else
                window.location.reload();
        }
        else {
            window.location.reload();
        }
    }
};

/* polyfill functions that are missing in IE8 */

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
        var i,
            pivot = (fromIndex) ? fromIndex : 0,
            length;

        if (!this) {
            throw new TypeError();
        }

        length = this.length;

        if (length === 0 || pivot >= length) {
            return -1;
        }

        if (pivot < 0) {
            pivot = length - Math.abs(pivot);
        }

        for (i = pivot; i < length; i++) {
            if (this[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };
}
if (!String.prototype.trim) {
    String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); };
}
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";

    if (this == null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}

if (!Array.prototype.map) {
    Array.prototype.map = function(callback, thisArg) {

        var T, A, k;

        if (this == null) {
            throw new TypeError(" this is null or not defined");
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(this);

        // 2. Let lenValue be the result of calling the Get internal method of O with the 
        //    argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0;

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if (typeof callback !== "function") {
            throw new TypeError(callback + " is not a function");
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 1) {
            T = thisArg;
        }

        // 6. Let A be a new array created as if by the expression new Array(len) where
        //    Array is the standard built-in constructor with that name and len is the 
        //    value of len.
        A = new Array(len);

        // 7. Let k be 0
        k = 0;

        // 8. Repeat, while k < len
        while(k < len) {

            var kValue, mappedValue;

            // a. Let Pk be ToString(k).
            //   This is implicit for LHS operands of the in operator
            // b. Let kPresent be the result of calling the HasProperty 
            //   internal method of O with argument Pk.
            //   This step can be combined with c
            // c. If kPresent is true, then
            if (k in O) {

                // i. Let kValue be the result of calling the Get internal
                //    method of O with argument Pk.
                kValue = O[ k ];

                // ii. Let mappedValue be the result of calling the Call 
                //     internal method of callback with T as the this value and 
                //     argument list containing kValue, k, and O.
                mappedValue = callback.call(T, kValue, k, O);

                // iii. Call the DefineOwnProperty internal method of A with arguments
                //      Pk, Property Descriptor {Value: mappedValue, : true, 
                //      Enumerable: true, Configurable: true}, and false.

                // In browsers that support Object.defineProperty, use the following:
                // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, 
                // enumerable: true, configurable: true });

                // For best browser support, use the following:
                A[ k ] = mappedValue;
            }
            // d. Increase k by 1.
            k++;
        }

        // 9. return A
        return A;
    };      
}



var method;
var noop = function () { };
var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeStamp', 'trace', 'warn'
];
var length = methods.length;
var console = (window.console = window.console || {});

while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
        console[method] = noop;
    }
}

/* end polyfill */

function loc(key, fallback) {
    return initInfo.resources[key] || fallback;
}

var userId;
var userNickname;
var loginKey;
var langId;
var metroAreaId;
var agencies;
var languageList;
var metroAreaList;
var formTransitTypes;
var socialLinks;
var userDetails;
var metroAdministrationList;
var countryList;
//var translationLanguages;
var userCountry;
var targetLogoLink =
    {
        "500":
               {
                   "322": "http://bit.ly/moovit_lp_tplan_band_rio",
                   "242": "http://bit.ly/moovit_lp_tplan_band_sp"
               },
        "501":
               {
                   "322": "",
                   "242": "http://bit.ly/moovit_lp_tplan_fdsp"
               },
        "504":
               {
                   "322": "",
                   "242": ""
               },
        "505":
               {
                   "322": "http://bit.ly/moovit_lp_tplan_globo_rj",
                   "242": "http://bit.ly/moovit_lp_tplan_globo_sp"
               },
         "507":
               {
                   "61": "http://bit.ly/moovit_lp_tplan_metroit"
               },
         "508":
               {
                   "242": "http://bit.ly/moovit_timemobsp_tripplanner"
               },
    };

NRGlobalVars.kmUnit = '1000'
NRGlobalVars.miUnit = '1609.344'
NRGlobalVars.slideSpeed = '400'
NRGlobalVars.popUpopacity = '0.76'

initInfo.load();
