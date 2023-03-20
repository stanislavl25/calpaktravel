"use strict";

let klaviyoSubscribeLoaded = false;
const klaviyoSubscribeUrl = '//www.klaviyo.com/media/js/public/klaviyo_subscribe.js';
const contactForms = document.querySelectorAll('.section__contact-form');

contactForms.forEach(contactForm => {
    contactForm.querySelector('.field__input').addEventListener('focus', async () => {
        if(!klaviyoSubscribeLoaded) {
            await loadScript(klaviyoSubscribeUrl);
        }

        if(!contactForm.classList.contains('section__contact-form--attached')) {
            contactForm.classList.add('section__contact-form--attached');
            KlaviyoSubscribe.attachToModalForm(`.section__contact-form[data-id="${contactForm.getAttribute('data-id')}"]`);
        }
    });
});