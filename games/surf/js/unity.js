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

var loaderScript = document.createElement("script");
loaderScript.src = window.config.unityWebglLoaderUrl;

loaderScript.onload = function() {
    console.log("Motor de Unity del CDN cargado con éxito. Iniciando instancia...");
    
    if (typeof UnityLoader !== "undefined") {
        var unityInstance = UnityLoader.instantiate("unity-container", window.config.unityWebglBuildUrl, {
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
    } else {
        console.error("Error crítico: El script del CDN cargó pero UnityLoader no está definido.");
    }
};

document.body.appendChild(loaderScript);
