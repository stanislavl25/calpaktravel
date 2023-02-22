"use strict";

const accordions = document.querySelectorAll('.accordion__title');
if (accordions.length > 0) accordions.forEach(accordion => accordion.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target,
        acc = target.closest('.accordion'),
        active = acc.parentNode.querySelector('.accordion--active');

    if(active) {
        active.classList.remove('accordion--active');
        if(acc == active) return;
    }
    acc.classList.toggle('accordion--active');
}));