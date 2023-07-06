"use strict";

let promoBarCells = document.querySelectorAll('.promo-bar-text-cell');
let index = 0;
if(promoBarCells.length > 1) {
    let cont = document.querySelector('.promo-bar-text-container');
    let cells = cont.querySelector('.promo-bar__cells');
    let timeout = Number(cont.getAttribute('data-timeout')) * 1000;
    setInterval(() => {
        index++;
        cells.style.setProperty('--page', index);

        if(index + 1 >= promoBarCells.length) {
            index = 0;
            setTimeout(() => {
                cells.classList.add('promo-bar__cells--back');
                setTimeout(() => {
                    cells.style.setProperty('--page', index);
                }, 100);
                setTimeout(() => {
                    cells.classList.remove('promo-bar__cells--back');
                }, 340);
            }, 350);
        }
    }, timeout);
}
if (document.querySelector('.promo-holiday-banner')) {
    document.querySelectorAll('.promo-holiday-banner a').forEach(function(element) {
    element.addEventListener('click', function(event) {
    event.stopPropagation();
    });
    });
    
    document.querySelector('.promo-holiday-banner').addEventListener('click', function(event) {
    event.preventDefault();
    if (this.classList.contains('promo-expanded')) {
        document.body.classList.remove('shipping-banner-on');
        this.classList.remove('promo-expanded');
        document.querySelector('.holiday-banner-dates').slideUp(300);
      } else {
        document.body.classList.add('shipping-banner-on');
        this.classList.add('promo-expanded');
        document.querySelector('.holiday-banner-dates').slideDown(300);
      }
    });

    let dates = ['Dec 13, 2022 12:00:00', 'Dec 20, 2022 12:00:00'];
    var now = new Date().getTime();
    for (let i = 0; i < dates.length; i++) {
    var countDownDate = new Date(dates[i]);
    var offset = countDownDate.getTimezoneOffset() * 60 * 1000 - 8 * 3600 * 1000;
    var countDownDate = countDownDate.getTime();
    var distance = countDownDate - now - offset;
    if (distance < 0) {
    document.querySelectorAll('.holiday-banner-date')[i].classList.add('inactive');
    }
    }
}

const body = document.body;
const promoSection = document.getElementById('shopify-section-promo-bar');

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      if (body.classList.contains('modal-open')) {
        promoSection.style.display = 'none';
      } else {
        promoSection.style.display = 'block';
      }
    }
  });
});
observer.observe(body, { attributes: true });

document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.header-container');
    const stickyElement = document.querySelector('.collection-filters__section');
    const stickyElement2 = document.querySelector('.pdp__floating-submit')
    const bodyElement = document.querySelector('body');
    const navElement = document.querySelector('.site-header__nav > ul.header__nav--full');
    const mobileMenuElement = document.querySelector('.mobile-menu .menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');


    const observernav = new ResizeObserver(entries => {
        for (let entry of entries) {
        if (entry.target === navbar) {
            const navbarHeight = navbar.offsetHeight;
            stickyElement.style.top = navbarHeight > 60 ? '80px' : '42px';
        }
        }
    });

    const observerSticky2 = new ResizeObserver(entries => {
        for (let entry of entries) {
        if (entry.target === stickyElement2) {
            const navbarHeight = navbar.offsetHeight;
            if (window.innerWidth <= 900) {
                stickyElement2.style.top = 'auto';
            } else {
                stickyElement2.style.top = navbarHeight > 60 ? '80px' : '42px';
            }
        }
        }
    });

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (window.innerWidth <= 900) {
              if (bodyElement.classList.contains('modal-open')) {
                navElement.style.display = 'flex';
              }  else {
                  navElement.style.display = 'none';
              }
            }
          }
        });
    });
      
      observer.observe(bodyElement, { attributes: true });      
    if (window.innerWidth <= 900){
        if (bodyElement.classList.contains('modal-open')) {
            navElement.style.display = 'flex';
        } else {
            navElement.style.display = 'none';   
        }
    }
    

    if(stickyElement) observernav.observe(navbar);
    if(stickyElement2) observerSticky2.observe(stickyElement2);
});