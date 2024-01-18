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
  swal.fire({
    title: 'Restablecimiento de Contraseña',
    html: '<input type="email" id="emailInput" class="swal2-input" placeholder="Correo electrónico"><div id="message" style="color: red; margin-top: 10px;"></div>',
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const email = document.getElementById('emailInput').value;
      if (!email) {
        const messageDiv = document.getElementById('message');
        messageDiv.innerText = 'Por favor, ingresa un correo electrónico válido.';
        return false;
      }
      sendResetPasswordEmail(email); // Llamamos directamente a la función sendResetPasswordEmail()
    },
    allowOutsideClick: false, // Mantenemos el sweet alert en pantalla
    showLoaderOnConfirm: true // Muestra un botón de carga en lugar del botón de enviar
  });
}

function sendResetPasswordEmail(email) {
  return new Promise((resolve, reject) => {
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        resolve();
      })
      .catch(error => {
        reject(error);
      });
  })
    .then(() => {
      swal.fire('Correo enviado', 'Se ha enviado un correo de restablecimiento de contraseña a tu dirección de correo electrónico.', 'success');
    })
    .catch(error => {
      console.error('Ha ocurrido un error:', error);
      swal.fire('Error', 'No se pudo enviar el correo de restablecimiento de contraseña. Por favor, intenta nuevamente más tarde.', 'error');
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
  fetch(checkEmailUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      if (data.IsEmailRegistered) {
        Swal.fire("Ya existe un usuario con ese correo", `Usuario: ${data.User}\nUID: ${data.UID}`, "error");
      } else {
        // Registrar usuario
        fetch(createUserUrl)
          .then(function(response) {
            return response.json();
          })
          .then(function(data) {
            if (data.success) {
              Swal.fire("Registro exitoso", `Usuario: ${username}`, "success");
              setTimeout(function() {
                window.location.href = "gz330"; // Redirigir a gz330 después de 8 segundos
              }, 8000);
            } else {
              Swal.fire("Error durante la creación del usuario");
            }
          })
          .catch(function(error) {
            Swal.fire(`Error durante la creación del usuario ${error}`);
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
