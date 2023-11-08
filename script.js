document.addEventListener("DOMContentLoaded", function() {
  var formulario = document.getElementById("formulario");
  var listaEspera = document.getElementById("listaEspera");
  var btnsTer = document.querySelectorAll(".btn-ter");
  var btnsPuesto = document.querySelectorAll(".btn-puesto");

  formulario.addEventListener("submit", function(e) {
    e.preventDefault();

    var nombre = document.getElementById("nombre").value;
    var sexo = document.getElementById("sexo").value;
    var terminal = "";
    var puesto = "";

    btnsPuesto.forEach(function(btn) {
      if (btn.classList.contains("active")) {
        puesto = btn.textContent;
      }
    });

    if (nombre && sexo && puesto) {
      var nuevoElemento = document.createElement("li");
      nuevoElemento.innerHTML = nombre + " - " + terminal + " - " + puesto;

      var btnBorrar = document.createElement("button");
      btnBorrar.textContent = "Borrar";
      btnBorrar.addEventListener("click", function() {
        clearInterval(temporizador);
        this.parentElement.remove();
        habilitarBotones();
      });

      nuevoElemento.appendChild(btnBorrar);

      var tiempo = document.createElement("span");
      tiempo.textContent = "00:00";
      nuevoElemento.appendChild(tiempo);

      listaEspera.appendChild(nuevoElemento);

      formulario.reset();

      restaurarColores();

      var tiempoInicio = Date.now();
      var temporizador = setInterval(function() {
        var tiempoActual = Date.now();
        var tiempoTranscurrido = tiempoActual - tiempoInicio;
        var minutos = Math.floor(tiempoTranscurrido / 60000);
        var segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);
        tiempo.textContent = ("0" + minutos).slice(-2) + ":" + ("0" + segundos).slice(-2);
      }, 1000);
    }
  });

  btnsPuesto.forEach(function(btn) {
    btn.addEventListener("click", function() {
      if (!this.classList.contains("active")) {
        btnsPuesto.forEach(function(btn) {
          btn.classList.remove("active");
          btn.style.backgroundColor = "";
          btn.style.color = "";
        });

        this.classList.add("active");
        this.style.backgroundColor = "blue";
        this.style.color = "white";
      }
    });
  });

  function restaurarColores() {
    btnsPuesto.forEach(function(btn) {
      btn.style.backgroundColor = "";
      btn.style.color = "";
    });
  }

  function habilitarBotones() {
    btnsPuesto.forEach(function(btn) {
      btn.removeAttribute("disabled");
    });
  }
});
