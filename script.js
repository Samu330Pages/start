// Configuración de Firebase
var config = {
    apiKey: "AIzaSyCqsYZA9wU9Y1YvYGicdZQ_7DDzfEVLXDU",
    authDomain: "number-ac729.firebaseapp.com",
    projectId: "number-ac729",
    storageBucket: "number-ac729.appspot.com",
    messagingSenderId: "36610055964",
    appId: "1:36610055964:web:ec80cc7ea2fb23287ce4d9",
    measurementId: "G-0BTNK7VNM3"
};

firebase.initializeApp(config);

// Verificar el estado de autenticación del usuario
firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // El usuario no ha iniciado sesión, redirigir al login
        window.location.href = "index";
    } else {
        // Obtener el nombre de usuario actual del objeto "user"
        //var username = user.displayName || user.email; // Si el nombre de usuario no está disponible, mostrar el correo electrónico

        // Actualizar el contenido del elemento "h2" con el mensaje de bienvenida
        //var welcomeMessage = document.getElementById("welcome-message");
        //welcomeMessage.innerText = "Bienvenido " + username;
    }
});

document.oncontextmenu = function() {
    return false
}
document.addEventListener("dragstart", function(event) {
    event.preventDefault();
});

document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && (event.key === 'u' || event.key === 'U')) {
        event.preventDefault();
        Swal.fire(
            'Sin acceso?',
            'Lo Siento pero no tienes permiso',
            'question'
        )
    }
});

/////////////////////////////////////////////////////////////////////
