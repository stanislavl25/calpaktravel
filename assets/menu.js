"use strict";

console.log('menu.js loaded');
function openMenu() {

}

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