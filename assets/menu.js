"use strict";

console.log('menu.js loaded');
function openMenu(menu) {
    document.body.classList.add('modal-open');

    const header = document.querySelector('.shopify-section--header');
    document.querySelector(`.menu-popup--${menu}`).classList.add('menu-popup--visible');
    header.setAttribute('data-menu', menu);
}

const slideMenuLinks = document.querySelectorAll('.slide-menu-item > .slide-menu__sub-button');
if(slideMenuLinks.length > 0) slideMenuLinks.forEach(slideMenuLink => slideMenuLink.addEventListener('click', function(e) {
    e.preventDefault();
    const menu = this.closest('.slide-menu');
    if(!menu) return;
    const submenu = menu.querySelector('.slide-menu');
    
    if(submenu) {
        const menuItem = this.closest('.slide-menu-item');
        const currentLevel = Number(menu.getAttribute('data-level'));

        menuItem.classList.add('slide-menu-item--active');
        menu.closest('.slide-menu__container').style.setProperty('--depth', currentLevel + 1);
    }
}));

const mobileMenuBackLinks = document.querySelectorAll('.slide-menu-item--back');
if(mobileMenuBackLinks.length > 0) mobileMenuBackLinks.forEach(mobileMenuBackLink => mobileMenuBackLink.addEventListener('click', function(e) {
    e.preventDefault();
    let menu = this.closest('.slide-menu');
    let currentLevel = Number(menu.getAttribute('data-level'));
    if(currentLevel > 0) {
        menu.closest('.slide-menu__container').style.setProperty('--depth', currentLevel - 1);
        menu.closest('.slide-menu-item').classList.remove('slide-menu-item--active');
    }
}));

let menuItems = document.querySelectorAll('.menu-item > a');
for(let i = 0; i < menuItems.length; i++) menuItems[i].addEventListener('click', e => {
    e.preventDefault();
    const closestMenu = e.target.closest('.menu-popup');
    const menuItem = e.target.closest('.menu-item');
    const id = menuItem.getAttribute('data-id');
    let parentMenu = e.target.closest('.menu');
    if(parentMenu) {
        let actives = parentMenu.querySelectorAll('.menu-item--active');
        for(let i = 0; i < actives.length; i++) actives[i].classList.remove('menu-item--active');
    }

    const activeDyn = closestMenu.querySelectorAll('.menu__dynamic-element--active');
    for(let i = 0; i < activeDyn.length; i++) activeDyn[i].classList.remove('menu__dynamic-element--active');
    const eligibleDyn = closestMenu.querySelectorAll('.menu__dynamic-element[data-id~="' + id + '"]');
    for(let i = 0; i < eligibleDyn.length; i++) eligibleDyn[i].classList.add('menu__dynamic-element--active');

    const mediaGrid = closestMenu.querySelector('.media-grid');
    const activeMediaCells = mediaGrid.querySelectorAll('.menu__dynamic-element--active');
    mediaGrid.setAttribute('data-num', activeMediaCells.length);

    menuItem.classList.add('menu-item--active');
});