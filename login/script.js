const loginText = document.querySelector(".title-text .login");
const loginForm = document.querySelector("form.login");
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.querySelector("form .signup-link a");
signupBtn.onclick = () => {
  loginForm.style.marginLeft = "-50%";
  loginText.style.marginLeft = "-50%";
};
loginBtn.onclick = () => {
  loginForm.style.marginLeft = "0%";
  loginText.style.marginLeft = "0%";
};
signupLink.onclick = () => {
  signupBtn.click();
};

// Initialize Firebase
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


//////////////////////////
function showResetPasswordInput() {
  Swal.fire({
    title: 'Restablecer contraseña',
    html: '<input type="email" id="reset-email" class="swal2-input" placeholder="Correo electrónico">',
    showCancelButton: true,
    confirmButtonText: 'Restablecer',
    cancelButtonText: 'Cancelar',
    preConfirm: function() {
      return new Promise(function(resolve) {
        resolve({
          email: document.getElementById('reset-email').value
        });
      });
    },
    onClose: function() {
      // Limpiar el valor del input cuando se cierre el SweetAlert
      document.getElementById('reset-email').value = '';
    }
  }).then(function(result) {
    // Obtener el correo electrónico ingresado por el usuario
    var email = result.value.email;

    if (email) {
      // Verificar si el correo está registrado en la base de datos
      firebase.auth().fetchSignInMethodsForEmail(email)
        .then(function(methods) {
          if (methods.length > 0) {
            // El correo pertenece a un usuario registrado, enviar correo de restablecimiento de contraseña
            firebase.auth().sendPasswordResetEmail(email)
              .then(function() {
                Swal.fire('Correo de restablecimiento enviado', 'Por favor, revisa tu bandeja de entrada', 'success');
              })
              .catch(function(error) {
                Swal.fire('Error', error.message, 'error');
              });
          } else {
            // El correo no está registrado en la base de datos
            Swal.fire('Error', 'El correo electrónico ingresado no pertenece a ninguna cuenta', 'error');
          }
        })
        .catch(function(error) {
          Swal.fire('Error', error.message, 'error');
        });
    }
  });
}
//////////////////////////

// Función para iniciar sesión
function login() {
    var email = document.getElementById("login-email").value;
    var password = document.getElementById("login-password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function() {
            Swal.fire("Inicio de sesión exitoso");
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === "auth/wrong-password") {
                Swal.fire("Contraseña incorrecta");
            } else {
                Swal.fire("Error durante el inicio de sesión, asegurate de poner bien tus datos");
            }
        });
}
// Función para registrarse
    function signup() {
    var email = document.getElementById("signup-email").value;
    var password = document.getElementById("signup-password").value;
    var confirmPassword = document.getElementById("signup-confirm-password").value;
    var username = document.getElementById("username").value;

    if (password !== confirmPassword) {
        Swal.fire("Las contraseñas no coinciden");
        return false; // Detiene el envío del formulario
    }

    // Verificar si el nombre de usuario tiene más de 8 caracteres
    if (username.length < 5) {
        Swal.fire("El nombre de usuario debe tener al menos 5 caracteres");
        return false; // Detiene el envío del formulario
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function() {
            Swal.fire("Registro exitoso, ahora puedes iniciar sesión");
        })
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === "auth/weak-password") {
                Swal.fire("La contraseña es débil, asegurate de ingresar una contraseña lo suficientemente fuerte");
            } else {
                Swal.fire("Error durante el registro");
            }
        });
  
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // El usuario ha iniciado sesión, redirigir a gz330.html
        // Realizar una solicitud a tu API para verificar el correo electrónico
      fetch("https://us-central1-number-ac729.cloudfunctions.net/checkEmail?email=" + encodeURIComponent(email);
      window.location.href = "gz330";
    } else {
        // El usuario no ha iniciado sesión
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
