"use strict";

const showPasses = document.querySelectorAll('.show-password');
showPasses.forEach(showPass => showPass.addEventListener('click', function() {
    const inpt = this.parentNode.querySelector('input');
    if(inpt.type === 'password') {
        inpt.type = 'text';
        this.querySelector('.show-password__cta').innerHTML = 'Hide';
    } else {
        inpt.type = 'password';
        this.querySelector('.show-password__cta').innerHTML = 'View';
    }
}));

let saveAttr = false;
const validatedForms = document.querySelectorAll('#customer_login, #create_customer, .customer__forgot-pass form');
validatedForms.forEach(validatedForm => validatedForm.addEventListener('submit', function(e) {
    const form = this;
    const fields = form.querySelectorAll('.field--validated');

    let errorsFound = false;
    fields.forEach(field => {
        const input = field.querySelector('input');
        if(input.value.trim() == '') {
            field.classList.add('field--invalid');
            errorsFound = true;
        } else field.classList.remove('field--invalid');
    });

    if(errorsFound) {
        e.preventDefault();
        saveAttr = form.getAttribute('onsubmit');
        form.setAttribute('onsubmit', 'return false');
    } else {
        if(saveAttr !== false) form.setAttribute('onsubmit', saveAttr);
        return true;
    }
}));