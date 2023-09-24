window.addEventListener('scroll', function() {
  var logo = document.getElementById('logo');
  var scrollPosition = window.pageYOffset;
  
  if (scrollPosition > 100) {
    logo.style.opacity = 0;
  } else {
    logo.style.opacity = 1;
  }
});
