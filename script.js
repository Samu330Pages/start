const slider = document.querySelector('.slider');
let counter = 1;
const sliderWidth = slider.clientWidth;

setInterval(function() {
  slider.style.transition = 'transform 1s ease-in-out';
  slider.style.transform = 'translateX(' + (-sliderWidth * counter) + 'px)';
  counter++;

  if (counter >= slider.children.length) {
    counter = 0;
    setTimeout(function() {
      slider.style.transition = 'none';
      slider.style.transform = 'translateX(' + (-sliderWidth * counter) + 'px)';
    }, 1000);
  }
}, 3000);
