window.onload = function() {
  // Función para iniciar sesión
  function login() {
    var email = document.getElementById("login-email").value;
    var password = document.getElementById("login-password").value;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(function() {
        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          text: 'Has iniciado sesión correctamente'
        });
      })
      .catch(function(error) {
        Swal.fire({
          icon: 'error',
          title: 'Inicio de sesión fallido',
          text: error.message
        });
      });

    return false;
  }

  // Función para registrarse
  function signup() {
    var email = document.getElementById("signup-email").value;
    var password = document.getElementById("signup-password").value;
    var confirmPassword = document.getElementById("signup-confirm-password").value;
    var username = document.getElementById("username").value;

    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrarse',
        text: 'Las contraseñas no coinciden'
      });
      return false;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(function() {
        // Actualizar el nombre de usuario
        firebase.auth().currentUser.updateProfile({
          displayName: username
        });

        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Se ha creado tu cuenta correctamente'
        });
      })
      .catch(function(error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al registrarse',
          text: error.message
        });
      });

    return false;
  }

  // Agregar evento submit a los formularios de inicio de sesión y registro
  document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();
    login();
  });

  document.getElementById("signup-form").addEventListener("submit", function(event) {
    event.preventDefault();
    signup();
  });

  // Agregar evento click al enlace "Olvidaste tu contraseña?"
  document.getElementById("reset-pass-btn").addEventListener("click", function(event) {
    event.preventDefault();

    Swal.fire({
      title: 'Restablecer contraseña',
      input: 'text',
      inputLabel: 'Ingresa tu dirección de correo electrónico',
      inputPlaceholder: 'Correo electrónico',
      showCancelButton: true,
      confirmButtonText: 'Restablecer',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: function(email) {
        return new Promise(function(resolve, reject) {
          firebase.auth().sendPasswordResetEmail(email)
            .then(function() {
              resolve();
            })
            .catch(function(error) {
              reject(Error(error.message));
            });
        });
      },
      allowOutsideClick: false
    }).then(function(result) {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: 'Se ha enviado un correo de restablecimiento de contraseña a tu dirección de correo electrónico. Por favor, revisa tu bandeja de entrada para obtener instrucciones adicionales.'
        });
      }
    });
  });
};
