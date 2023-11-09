$(function () {
  const $carouselInner = $(".carousel-inner");
  $carouselInner.find(">:first-child").addClass('active')
  const $authButton = $(".authButton");
  const $authLink = $(".authChoice");

  $authLink.click(ev => {
    ev.stopPropagation();
  })

  $authButton.click(ev => {
    const $this = $(ev.target);
    $this.find(".auth-link").trigger('click');
  })

});