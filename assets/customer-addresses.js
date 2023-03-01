"use strict";

const addressesCont = document.querySelector('.account-addresses');
const editLinks = document.querySelectorAll('.address__edit-link');
editLinks.forEach(editLink => editLink.addEventListener('click', e => {
    e.preventDefault();

    addressesCont.classList.add('account-addresses--editing');
    e.target.closest('.address').classList.add('address--edited');
}));

const editCancelLinks = document.querySelectorAll('.address__edit .address__cancel');
editCancelLinks.forEach(editCancelLink => editCancelLink.addEventListener('click', e => {
    e.preventDefault();
    
    addressesCont.classList.remove('account-addresses--editing');
    e.target.closest('.address').classList.remove('address--edited');
}));

const newAddressButton = document.querySelector('.button--add-address');
if(newAddressButton) newAddressButton.addEventListener('click', e => {
    e.preventDefault();

    addressesCont.classList.add('account-addresses--adding');
});

const addCancelLink = document.querySelector('.address__new .address__cancel');
if(addCancelLink) addCancelLink.addEventListener('click', e => {
    e.preventDefault();

    addressesCont.classList.remove('account-addresses--adding');
});

const actButtons = document.querySelectorAll('.field-activator');
actButtons.forEach(actButton => actButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.closest('.field--optionally-activated').classList.add('field--active');
}))