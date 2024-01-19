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
// Función para mostrar el input de restablecimiento de contraseña
function showResetPasswordInput() {
  Swal.fire({
    title: 'Restablecer contraseña',
    html: '<input type="email" id="emailInput" class="swal2-input" placeholder="Correo electrónico">',
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    showLoaderOnConfirm: true,
    preConfirm: function () {
      const email = Swal.getPopup().querySelector('#emailInput').value;

      if (!email || !validateEmail(email)) {
        Swal.showValidationMessage('Por favor, ingresa un correo electrónico válido');
        return false;
      }

      return fetch(`https://us-central1-number-ac729.cloudfunctions.net/checkEmail?email=${email}`)
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.IsEmailRegistered) {
            const emailAddress = data.Result;

            return firebase.auth().sendPasswordResetEmail(emailAddress)
              .then(function() {
                Swal.fire({
                  title: 'Correo enviado',
                  text: `Se ha enviado un correo de restablecimiento de contraseña\nUsuario: ${data.User}`,
                  icon: 'success'
                });
              })
              .catch(function(error) {
                Swal.showValidationMessage(error.message);
              });
          } else {
            throw new Error('Correo no registrado');
          }
        })
        .catch(function(error) {
          Swal.showValidationMessage(error.message);
        });
    },
    allowOutsideClick: function() {
      return !Swal.isLoading();
    }
  });
}

// Validación de formato de correo electrónico
function validateEmail(email) {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return emailRegex.test(email);
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
  var checkEmailUrl = "https://us-central1-number-ac729.cloudfunctions.net/checkEmail?email=" + email;
  var createUserUrl = "https://us-central1-number-ac729.cloudfunctions.net/createUser?email=" + email + "&user=" + username;

  if (password !== confirmPassword) {
    Swal.fire("Las contraseñas no coinciden");
    return false; // Detiene el envío del formulario
  }

  // Verificar si el nombre de usuario tiene más de 5 caracteres
  if (username.length < 5) {
    Swal.fire("El nombre de usuario debe tener al menos 5 caracteres");
    return false; // Detiene el envío del formulario
  }

  // Verificar si el correo ya está registrado
  fetch(createUserUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.IsEmailRegistered === true) {
        Swal.fire("Ya existe un usuario con ese correo", `Usuario: ${data.User}`, "error");
      } else {
        // Registrar usuario y mostrar mensaje de éxito
        fetch(checkEmailUrl)
        Swal.fire({
          title: "Registro exitoso",
          text: `Usuario: ${username}\nIniciando sesion...`,
          icon: "success",
          showLoaderOnConfirm: true,
          timer: 4000, // Cerrar automáticamente después de 4 segundos
          timerProgressBar: true,
          allowEscapeKey: false,
          allowOutsideClick: false
        }).then(function() {
          // Registrar usuario en Firebase y redirigir a gz330 después de 8 segundos
          firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function() {
              window.location.href = "gz330";
            })
            .catch(function(error) {
              Swal.fire(`Error durante la creación del usuario ${error}`);
            });
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
