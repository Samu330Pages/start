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
    console.log("Motor de Unity detectado y verificado con éxito.");
    
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

        if (window.PokiSDK) {
            window.PokiSDK.gameLoadingFinished();
            window.PokiSDK.gameplayStart();
        }
    } else {
        console.error("Error crítico: El motor se descargó pero la variable 'UnityLoader' sigue sin estar lista.");
    }
};

document.body.appendChild(loaderScript);
