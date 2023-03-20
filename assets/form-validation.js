"use strict";

let saveAttr = false;
const newCustomerForm = document.querySelector('#create_customer');
if(newCustomerForm) newCustomerForm.addEventListener('submit', function(e) {

    let firstnameEl = newCustomerForm.querySelector('#FirstName');
    let lastnameEl = newCustomerForm.querySelector('#LastName');
    let firstname = firstnameEl.value.trim();
    let lastname = lastnameEl.value.trim();
    if(firstname == '' || lastname == '') {
        e.preventDefault();
        saveAttr = newCustomerForm.getAttribute('onsubmit');
        newCustomerForm.setAttribute('onsubmit', 'return false');
    } else {
        if(saveAttr !== false) newCustomerForm.setAttribute('onsubmit', saveAttr);
        return true;
    }
        
    if(firstname == '') {
        firstnameEl.parentNode.querySelector('.field__error-message--js').classList.add('field__error-message--active');
    } else firstnameEl.parentNode.querySelector('.field__error-message--js').classList.remove('field__error-message--active');

    if(lastname == '') {
        lastnameEl.parentNode.querySelector('.field__error-message--js').classList.add('field__error-message--active');
    } else lastnameEl.parentNode.querySelector('.field__error-message--js').classList.remove('field__error-message--active');
});