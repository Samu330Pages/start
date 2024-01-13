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
  return false;
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
            return false; // Detiene el envío del formulario
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


// ...

// Función para restablecer la contraseña
function resetPassword() {
    var email = document.getElementById("reset-email").value;

    firebase.auth().fetchSignInMethodsForEmail(email)
        .then(function(signInMethods) {
            // Verificar si el correo está registrado en Firebase
            if (signInMethods.length === 0) {
                Swal.fire("El correo electrónico no está registrado");
                return; // Detiene la ejecución del resto del código
            }

            // El correo está registrado, enviar correo de restablecimiento de contraseña
            firebase.auth().sendPasswordResetEmail(email)
                .then(function() {
                    Swal.fire("Correo de restablecimiento de contraseña enviado");
                })
                .catch(function(error) {
                    Swal.fire("Error durante el restablecimiento de contraseña");
                });
        })
        .catch(function(error) {
            Swal.fire("Error al verificar el correo electrónico");
        });
}

// Función para mostrar el input de restablecer contraseña
function showResetPasswordInput() {
    Swal.fire({
        title: 'Restablecer contraseña',
        html: '<input type="email" id="reset-email" class="swal2-input" placeholder="Correo electrónico" required>',
        confirmButtonText: 'Restablecer',
        showLoaderOnConfirm: true,
        preConfirm: function() {
            resetPassword();
        }
    });
    return false; // Detiene el envío del formulario
}

document.addEventListener("DOMContentLoaded", function() {
    // ...

    // Agregar evento al enlace de restablecer contraseña
    var resetPasswordLink = document.querySelector("form .pass-link a");
    resetPasswordLink.onclick = showResetPasswordInput;

    // ...
});


firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // El usuario ha iniciado sesión, redirigir a gz330.html
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
