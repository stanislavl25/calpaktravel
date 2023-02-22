"use strict";

const textDropdowns = document.querySelectorAll('.text-dropdown:not(.text-dropdown--loaded)');
if(textDropdowns.length > 0) textDropdowns.forEach(textDropdown => {
    textDropdown.classList.add('text-dropdown--loaded');
    let tdValue = textDropdown.querySelector('.text-dropdown__value');
    tdValue.addEventListener('click', function(e) {
        e.preventDefault();
        this.closest('.text-dropdown').classList.toggle('text-dropdown--active');
    });

    let tdOptions = textDropdown.querySelectorAll('.text-dropdown__option');
    if(tdOptions.length > 0) tdOptions.forEach(tdOption => tdOption.addEventListener('click', function(e) {
        e.preventDefault();
        const td = this.closest('.text-dropdown');

        let actives = this.parentElement.querySelector('.text-dropdown__option--selected');
        if(actives) actives.classList.remove('text-dropdown__option--selected');
        
        this.classList.add('text-dropdown__option--selected');
        
        td.querySelector('.text-dropdown__value').innerHTML = this.innerHTML;
        td.classList.toggle('text-dropdown--active');

        let target = td.getAttribute('data-target');
        if(target) {
            let index = getIndex(this);
            let targetEl = document.querySelector(target);
            if(targetEl) {
                let targetEls = targetEl.querySelectorAll('.collection-showcase');
                for(let i = 0; i < targetEls.length; i++) {
                    if(targetEls[i].classList.contains('collection-showcase--active')) targetEls[i].classList.remove('collection-showcase--active');
                    if(i == index) targetEls[i].classList.add('collection-showcase--active');
                }
            }
            
        }
    }));
});