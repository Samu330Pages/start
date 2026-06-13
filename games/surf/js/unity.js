"use strict";

// 1. Crear el contenedor oficial donde Unity renderizará el juego
var container = document.createElement("div");
container.id = "unity-container";
container.style.width = "100%";
container.style.height = "100%";
container.style.position = "absolute";
container.style.top = "0";
container.style.left = "0";
document.body.appendChild(container);

// 2. Cargar el motor de UnityLoader correspondiente
var script = document.createElement("script");
script.src = window.config.unityWebglLoaderUrl;
script.onload = function() {
    console.log("UnityLoader cargado correctamente. Iniciando juego...");
    
    // 3. Forzar la inicialización ignorando por completo si es móvil o PC
    var unityInstance = UnityLoader.instantiate("unity-container", window.config.unityWebglBuildUrl, {
        onProgress: function(instance, progress) {
            if (window.PokiSDK && typeof window.PokiSDK.gameLoadingProgress === "function") {
                window.PokiSDK.gameLoadingProgress({ percentage: progress });
            }
        },
        Module: {
            backgroundColor: "#222428",
            // Forzar WebGL básico si el teléfono requiere optimización
            preferLowPowerToHighPerformance: true 
        }
    });
    
    if (window.PokiSDK) {
        if (typeof window.PokiSDK.gameLoadingFinished === "function") window.PokiSDK.gameLoadingFinished();
        if (typeof window.PokiSDK.gameplayStart === "function") window.PokiSDK.gameplayStart();
    }
};
document.body.appendChild(script);
