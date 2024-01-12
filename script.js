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
        var username = user.displayName || user.email; // Si el nombre de usuario no está disponible, mostrar el correo electrónico

        // Actualizar el contenido del elemento "h2" con el mensaje de bienvenida
        var welcomeMessage = document.getElementById("welcome-message");
        welcomeMessage.innerText = "Bienvenido " + username;
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

var header = document.querySelector('header');
var containerCards = document.querySelector('.container__cards');

header.addEventListener('click', function() {
   containerCards.classList.toggle('show');
});

var logoutBtn = document.getElementById('logout-btn');
var resetPassBtn = document.getElementById('reset-pass-btn');

logoutBtn.addEventListener('click', function() {
   firebase.auth().signOut().then(function() {
      // Acción después de cerrar sesión, como redirigir a una página de inicio de sesión
   }).catch(function(error) {
      console.log(error.message);
   });
});

resetPassBtn.addEventListener('click', function() {
   var email = prompt("Por favor, ingresa tu dirección de correo electrónico para restablecer la contraseña:");

   if (email != null) {
      firebase.auth().sendPasswordResetEmail(email)
         .then(function() {
            // Correo de restablecimiento de contraseña enviado con éxito
            Swal.fire({
               icon: 'success',
               title: 'Correo enviado',
               text: 'Se ha enviado un correo de restablecimiento de contraseña a tu dirección de correo electrónico. Por favor, revisa tu bandeja de entrada para obtener instrucciones adicionales.'
            });
         })
         .catch(function(error) {
            // Error al enviar el correo de restablecimiento de contraseña
            Swal.fire({
               icon: 'error',
               title: 'Error',
               text: 'Ocurrió un error al enviar el correo de restablecimiento de contraseña. Por favor, verifica que la dirección de correo electrónico sea correcta e inténtalo de nuevo.'
            });
         });
   }
});
