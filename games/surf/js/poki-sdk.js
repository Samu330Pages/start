(function() {
    "use strict";

    window.PokiSDK = {
        init: function() {
            console.log("PokiSDK local inicializado correctamente.");
            return Promise.resolve(true);
        },
        initWithVideoHB: function() {
            return Promise.resolve(true);
        },
        customEvent: function() {},
        destroyAd: function() {},
        getLeaderboard: function() {
            return Promise.resolve([]);
        },
        disableProgrammatic: function() {},
        gameLoadingStart: function() {},
        gameLoadingFinished: function() {},
        gameInteractive: function() {},
        roundStart: function() {},
        roundEnd: function() {},
        muteAd: function() {},
        setDebug: function() {},
        gameplayStart: function() {},
        gameplayStop: function() {},
        gameLoadingProgress: function(e) {
            console.log("Cargando Subway Surfers: " + Math.round((e?.percentage || 0) * 100) + "%");
        },
        happyTime: function() {},
        setPlayerAge: function() {},
        togglePlayerAdvertisingConsent: function() {},
        toggleNonPersonalized: function() {},
        setConsentString: function() {},
        logError: function() {},
        sendHighscore: function() {},
        setDebugTouchOverlayController: function() {}
    };

    window.commercialBreak = function() {
        return Promise.resolve(true);
    };
    window.rewardedBreak = function() {
        return Promise.resolve(true);
    };
})();
