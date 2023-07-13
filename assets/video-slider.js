"use strict";

const navItems = document.querySelectorAll('.shopify-section--video-slider .nav-hero__item');
if(navItems.length > 0) navItems.forEach(navItem => navItem.addEventListener('click', function(e) {
    e.preventDefault();
    const index = Number(this.getAttribute('data-target')) - 1;

    const slider = this.closest('.shopify-section--video-slider').querySelector('.slider');

    moveToSlide(slider, index);
}));

document.addEventListener('sliderUpdate', e => {
    const slider = e.detail.slider;
    const index = e.detail.slideNumber;

    slider.querySelectorAll('.slide')[index].querySelector('iframe').contentWindow.postMessage(JSON.stringify({ method: 'play', value: 1 }), '*');
});