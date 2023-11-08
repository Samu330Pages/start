document.addEventListener("DOMContentLoaded", function() {
  var formulario = document.getElementById("formulario");
  var listaEspera = document.getElementById("listaEspera");
  var btnsPuesto = document.querySelectorAll(".btn-puesto");

  formulario.addEventListener("submit", function(e) {
    e.preventDefault();

    var nombre = document.getElementById("nombre").value;
    var sexo = document.getElementById("sexo").value;
    var puesto = "";
    
    btnsPuesto.forEach(function(btn) {
      if (btn.classList.contains("active")) {
        puesto = btn.textContent;
      }
    });

    if (nombre && sexo && puesto) {
      var nuevoElemento = document.createElement("li");
      nuevoElemento.innerHTML = nombre + " - " + sexo + " - " + puesto;

      var btnBorrar = document.createElement("button");
      btnBorrar.textContent = "Borrar";
      btnBorrar.addEventListener("click", function() {
        this.parentElement.remove();
        habilitarBotones();
      });

      nuevoElemento.appendChild(btnBorrar);

      listaEspera.appendChild(nuevoElemento);

      formulario.reset();

      restaurarColores();
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
