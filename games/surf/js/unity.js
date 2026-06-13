"use strict";

// 1. Crear el contenedor oficial en el DOM
var container = document.createElement("div");
container.id = "unity-container";
container.style.width = "100%";
container.style.height = "100%";
container.style.position = "absolute";
container.style.top = "0";
container.style.left = "0";
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
                preferLowPowerToHighPerformance: true 
            }
        });
        
        if (window.PokiSDK) {
            window.PokiSDK.gameLoadingFinished();
            window.PokiSDK.gameplayStart();
        }
    } else {
        console.error("Error crítico: El motor se descargó pero la variable 'UnityLoader' sigue sin estar lista.");
    }
};

// Insertar el script en el documento para iniciar la secuencia ordenada de descarga
document.body.appendChild(loaderScript);
