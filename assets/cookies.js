"use strict";

const cookiesPopup = document.querySelector('.cookies-popup');
if(cookiesPopup) {
    let cookiesAccepted = localStorage.getItem('cookies-accepted');

    if(!cookiesAccepted) {
        cookiesPopup.classList.add('cookies-popup--active');

        const accept = document.querySelector('.button--accept-cookies');
        const overlay = document.querySelector('.cookies-popup__overlay');

        accept.addEventListener('click', function() {
            cookiesPopup.classList.remove('cookies-popup--active');
            localStorage.setItem('cookies-accepted', true);
        });

        if(overlay) overlay.addEventListener('click', function() {
            cookiesPopup.classList.remove('cookies-popup--active');
        });
    }
}