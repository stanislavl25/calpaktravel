"use strict";

const accordions = document.querySelectorAll('.accordion__title');
[].map.call(accordions, function(element){
    const tab = element.closest('.accordion')
    tab.querySelector('.accordion__title').setAttribute('aria-expanded', 'false');
});
if (accordions.length > 0) accordions.forEach(accordion =>    
    accordion.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.target,
        acc = target.closest('.accordion'),
        active = acc.parentNode.querySelector('.accordion--active');

    if(active) {
        active.classList.remove('accordion--active');
        acc.querySelector('.accordion__title').setAttribute('aria-expanded', 'false');
        if(acc == active) return;
    }
    acc.classList.toggle('accordion--active');
      acc.querySelector('.accordion__title').setAttribute(
        'aria-expanded', 'true');
}));

