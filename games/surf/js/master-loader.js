"use strict";

if (!window.config) throw Error("window.config not found");

if (!window.config.unityWebglLoaderUrl) {
    var versionSplit = window.config.unityVersion ? window.config.unityVersion.split(".") : [],
        year = versionSplit[0],
        minor = versionSplit[1];
    switch (year) {
        case "2019":
            window.config.unityWebglLoaderUrl = (1 === parseInt(minor)) ? 
                "https://cdn.jsdelivr.net/gh/bubbls/subwaysurfersmerge/UnityLoader.2019.1.js" : 
                "https://cdn.jsdelivr.net/gh/bubbls/subwaysurfersmerge/UnityLoader.2019.2.js";
            break;
        default:
            window.config.unityWebglLoaderUrl = "https://cdn.jsdelivr.net/gh/bubbls/subwaysurfersmerge/UnityLoader.js";
    }
}

window.PokiSDK = {
    init: function() { return Promise.resolve(true); },
    gameLoadingStart: function() {},
    gameLoadingProgress: function() {},
    gameLoadingFinished: function() {},
    gameplayStart: function() {},
    gameplayStop: function() {},
    commercialBreak: function() { return Promise.resolve(true); },
    rewardedBreak: function() { return Promise.resolve(true); }
};
var gameScript = document.createElement("script");
gameScript.src = "js/unity.js"; 
document.body.appendChild(gameScript);
