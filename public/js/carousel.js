$(document).ready(function () {
  // Set an interval to switch to the next slide every 6 seconds
  setInterval(function () {
    $('#carousel').carousel('next');
  }, 6000);

  // Reset the interval when a slide is clicked
  $('.carousel-control-prev, .carousel-control-next').click(function () {
    clearInterval(intervalId);
    intervalId = setInterval(function () {
      $('#carousel').carousel('next');
    }, 6000);
  });
});
