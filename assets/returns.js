"use strict";

const returnsButtons = document.querySelectorAll('.returns__button');
if(returnsButtons.length > 0) returnsButtons.forEach(returnsButton => returnsButton.addEventListener('click', function(e) {
    e.preventDefault();
    let active = this.closest('.returns__container').querySelector('.returns__block--active');
    if(active) active.classList.remove('returns__block--active');

    let thisBlock = this.closest('.returns__block');

    if(thisBlock == active) return;

    thisBlock.classList.add('returns__block--active');
}));