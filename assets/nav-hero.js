"use strict";

const navItems = document.querySelectorAll('.nav-hero__item');
if(navItems.length > 0) navItems.forEach(navItem => navItem.addEventListener('click', function(e) {
    e.preventDefault();
    const index = Number(this.getAttribute('data-target')) - 1;
    let sections = document.querySelectorAll('.content-for-layout .shopify-section');
    let anchor = sections[index].querySelector('.page-anchor');

    if(anchor) anchor.scrollIntoView({ behavior: 'smooth' });
    else sections[index].scrollIntoView({ behavior: 'smooth' });
}));