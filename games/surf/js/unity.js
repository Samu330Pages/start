"use strict";

var container = document.createElement("div");
container.id = "unity-container";
container.style.position = "fixed";
container.style.top = "0";
container.style.left = "0";
container.style.width = "100vw";
container.style.height = "100vh";
container.style.backgroundColor = "#222428";
container.style.zIndex = "999999";
document.body.appendChild(container);

var cdnBaseUrl = "https://cdn.jsdelivr.net/gh/bubbls/subwaysurfersmerge/mexico/";

var originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (url.indexOf("Mexico3.") !== -1 || url.indexOf(".unityweb") !== -1 || url.indexOf(".json") !== -1) {
        var filename = url.substring(url.lastIndexOf('/') + 1);
        url = cdnBaseUrl + filename;
    }
    return originalOpen.call(this, method, url, ...args);
};

var loaderScript = document.createElement("script");
loaderScript.src = window.config.unityWebglLoaderUrl;

loaderScript.onload = function() {
    console.log("Motor de Unity detectado con éxito. Iniciando simulación de entorno...");
    
    if (typeof UnityLoader !== "undefined") {
        var unityInstance = UnityLoader.instantiate("unity-container", "Mexico3.json", {
            onProgress: function(instance, progress) {
                if (window.PokiSDK && typeof window.PokiSDK.gameLoadingProgress === "function") {
                    window.PokiSDK.gameLoadingProgress({ percentage: progress });
                }
            },
            Module: {
                backgroundColor: "#222428",
                preferLowPowerToHighPerformance: true,
                compatibilityCheck: function(unityInstance, onsuccess, onerror) {
                    onsuccess();
                }
            }
        });
        
        window.unityGame = unityInstance;

        if (window.PokiSDK) {
            window.PokiSDK.gameLoadingFinished();
            window.PokiSDK.gameplayStart();
        }
    } else {
        console.error("Error crítico: El motor se descargó pero la variable 'UnityLoader' no está lista.");
    }
};

document.body.appendChild(loaderScript);
