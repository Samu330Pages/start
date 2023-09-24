document.getElementById("btn-link").addEventListener("click", function() {
  window.open("http://www.paginaenlace.com");
});

document.getElementById("btn-enviar").addEventListener("click", function() {
  var mensaje = document.getElementById("input-msg").value;
  var telefono = "1234567890"; // Ingresar el número de teléfono al que se enviará el mensaje
  var url = "https://wa.me/" + telefono + "?text=" + encodeURIComponent(mensaje);
  window.open(url);
});
