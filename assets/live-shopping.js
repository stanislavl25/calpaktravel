"use strict";

let liveShoppingButtons = document.querySelectorAll('.live-shopping__buttons .button');

for(let i = 0; i < liveShoppingButtons.length; i++) liveShoppingButtons[i].addEventListener('click', function(e) {
    e.preventDefault();
    let index = this.getAttribute('data-index') * 1;
    let prnt = this.closest('.shopify-section');
    if(index == 0) prnt.nextSibling.querySelector('.scroll-anchor').scrollIntoView({behavior: 'smooth'});
    else if(index == 1) prnt.nextSibling.nextSibling.querySelector('.scroll-anchor').scrollIntoView({behavior: 'smooth'});
    else if(index == 2) prnt.nextSibling.nextSibling.nextSibling.querySelector('.scroll-anchor').scrollIntoView({behavior: 'smooth'});
});