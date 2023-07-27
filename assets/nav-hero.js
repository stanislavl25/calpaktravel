"use strict";

const getTop = el => el.offsetTop + (el.offsetParent && getTop(el.offsetParent));

const navItems = document.querySelectorAll('.shopify-section--nav-hero .nav-hero__item');
if(navItems.length > 0) navItems.forEach(navItem => navItem.addEventListener('click', function(e) {
    e.preventDefault();
    const index = Number(this.getAttribute('data-target')) - 1;
    let sections = document.querySelectorAll('.content-for-layout .shopify-section');
    let anchor = sections[index].querySelector('.page-anchor');

    if(!anchor) anchor = sections[index];
    
    window.scroll({top: getTop(anchor), behavior: "smooth"})
}));