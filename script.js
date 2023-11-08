document.addEventListener("DOMContentLoaded", function() {
  var formulario = document.getElementById("formulario");
  var listaEspera = document.getElementById("listaEspera");
  
  formulario.addEventListener("submit", function(e) {
    e.preventDefault();
    
    var nombre = document.getElementById("nombre").value;
    var sexo = document.getElementById("sexo").value;
    var puesto = document.querySelector(".btn-puesto.active").textContent;
    
    if (nombre && sexo && puesto) {
      var nuevoElemento = document.createElement("li");
      nuevoElemento.innerHTML = nombre + " - " + sexo + " - " + puesto;
      
      var btnBorrar = document.createElement("button");
      btnBorrar.textContent = "Borrar";
      btnBorrar.addEventListener("click", function() {
        this.parentElement.remove();
      });
      
      nuevoElemento.appendChild(btnBorrar);
      
      listaEspera.appendChild(nuevoElemento);
      
      formulario.reset();
    }
  });
  
  var btnsPuesto = document.querySelectorAll(".btn-puesto");
  
  btnsPuesto.forEach(function(btn) {
    btn.addEventListener("click", function() {
      if (!this.classList.contains("active")) {
        btnsPuesto.forEach(function(btn) {
          btn.classList.remove("active");
        });
        
        this.classList.add("active");
      }
    });
  });
});
