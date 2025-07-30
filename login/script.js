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

      return fetch(`https://us-central1-number-ac729.cloudfunctions.net/checkEmailV1?email=${email}`)
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

function validateEmail(email) {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return emailRegex.test(email);
}
//////////////////////////
function login() {
    event.preventDefault();
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
function signup() {
  var email = document.getElementById("signup-email").value;
  var password = document.getElementById("signup-password").value;
  var confirmPassword = document.getElementById("signup-confirm-password").value;
  var username = document.getElementById("username").value;
  var checkEmailUrl = "https://us-central1-number-ac729.cloudfunctions.net/checkEmailV1?email=" + email;
  var createUserUrl = "https://us-central1-number-ac729.cloudfunctions.net/createUserV1?email=" + email + "&user=" + username;

  if (password !== confirmPassword) {
    Swal.fire("Las contraseñas no coinciden");
    return false;
  }

  if (username.length < 5) {
    Swal.fire("El nombre de usuario debe tener al menos 5 caracteres");
    return false;
  }

  fetch(checkEmailUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.IsEmailRegistered === true) {
        Swal.fire("Ya existe un usuario con ese correo", `Usuario: ${data.User}`, "error");
      } else {
        fetch(createUserUrl)
        Swal.fire({
          title: "Registro exitoso",
          text: `Usuario: ${username}\nIniciando sesion...`,
          icon: "success",
          showLoaderOnConfirm: true,
          timer: 4000,
          timerProgressBar: true,
          allowEscapeKey: false,
          allowOutsideClick: false
        }).then(function() {
          firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function() {
              window.location.href = "https://samu330.com";
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
    window.location.href = "https://samu330.com";
  } else {
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
