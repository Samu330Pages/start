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
function showresetpasswordinput() {
  swal.fire({
    title: "Restablecer contraseña",
    html: '<input type="email" id="email-input" class="swal2-input" placeholder="Correo electrónico">',
    showCancelButton: true,
    confirmButtonText: "Restablecer",
    cancelButtonText: "Cancelar",
    reverseButtons: true
  }).then((result) => {
    if (result.value) {
      const email = document.getElementById('email-input').value;

      fetch(`https://us-central1-number-ac729.cloudfunctions.net/checkEmail?email=${email}`)
        .then(response => response.json())
        .then(data => {
          if (data.IsEmailRegistered) {
            // Enviar correo para restablecer contraseña usando Firebase
            firebase.auth().sendPasswordResetEmail(email)
              .then(() => {
                swal.fire("Correo enviado", "Se ha enviado un correo para restablecer la contraseña", "success");
              })
              .catch(error => {
                swal.fire("Error", "Ha ocurrido un error al enviar el correo", "error");
              });
          } else {
            // Eliminar el documento usando la función deleteDocument de la API
            fetch(`https://us-central1-number-ac729.cloudfunctions.net/deleteDocument?email=${email}`)
              .then(response => response.json())
              .then(data => {
                if (data.Result === "Document deleted") {
                  swal.fire("Error", `El correo ${email} no está registrado`, "error");
                } else {
                  swal.fire("Error", "Ha ocurrido un error al eliminar el documento", "error");
                }
              })
              .catch(error => {
                swal.fire("Error", "Ha ocurrido un error al eliminar el documento", "error");
              });
          }
        })
        .catch(error => {
          swal.fire("Error", "Ha ocurrido un error al verificar el correo", "error");
        });
    }
  });
}
//////////////////////////

// Función para iniciar sesión
function login() {
    event.preventDefault(); // Evita la recarga de la página por defecto
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
////
// Función para registrarse
function signup() {
    var email = document.getElementById("signup-email").value;
    var password = document.getElementById("signup-password").value;
    var confirmPassword = document.getElementById("signup-confirm-password").value;
    var username = document.getElementById("username").value;
    var apiUrl = "https://us-central1-number-ac729.cloudfunctions.net/checkEmail?email=" + email;

    if (password !== confirmPassword) {
        Swal.fire("Las contraseñas no coinciden");
        return false; // Detiene el envío del formulario
    }

    // Verificar si el nombre de usuario tiene más de 5 caracteres
    if (username.length < 5) {
        Swal.fire("El nombre de usuario debe tener al menos 5 caracteres");
        return false; // Detiene el envío del formulario
    }

    fetch(apiUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            if (data.IsEmailRegistered) {
                Swal.fire("Ya existe un usuario con ese correo. UID: " + data.UID);
            } else {
                // Continuar con el registro
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then(function() {
                        Swal.fire("Registro exitoso, ahora puedes iniciar sesión");
                    })
                    .catch(function(error) {
                        var errorCode = error.code;
                        var errorMessage = error.message;
                        if (errorCode === "auth/weak-password") {
                            Swal.fire("La contraseña es débil, asegúrate de ingresar una contraseña lo suficientemente fuerte");
                        } else {
                            Swal.fire("Error durante el registro");
                        }
                    });
            }
        })
        .catch(function(error) {
            Swal.fire(`Error durante la verificación del correo ${error}`);
        });
}
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // El usuario ha iniciado sesión, redirigir a gz330.html
        window.location.href = "gz330";
    } else {
        // El usuario no ha iniciado sesión
    }
});
////
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
