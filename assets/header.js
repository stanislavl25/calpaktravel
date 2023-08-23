"use strict";

let searchPlaceholders = document.querySelectorAll('.search-placeholders');
if(searchPlaceholders.length > 0) {
    const searchPlaceholdersTimeout = 3000;

    function restoreSearchPlaceholder(searchPlaceholder) {
        setTimeout(() => searchPlaceholder.classList.add('search-placeholders--no-anim'), 520);
        setTimeout(() => searchPlaceholder.style.setProperty('--page', 0), 570);
        setTimeout(() => searchPlaceholder.classList.remove('search-placeholders--no-anim'), 620);
    }
    
    setInterval(() => {
        for(let i = 0; i < searchPlaceholders.length; i++) {
            const num = parseInt(searchPlaceholders[i].getAttribute('data-num'));
            let page = searchPlaceholders[i].style.getPropertyValue('--page');
            page++;
            searchPlaceholders[i].style.setProperty('--page', page);
            
            if(page >= num) {
                page = 0;
                restoreSearchPlaceholder(searchPlaceholders[i]);
            }
        }
    }, searchPlaceholdersTimeout);
}

const headerOverlay = document.querySelector('.site-header__overlay');
if(headerOverlay) headerOverlay.addEventListener('click', () => {
    let closeLink = document.querySelector('.menu-popup--visible .menu-close');
    if(closeLink) closeLink.click();
});

let searchActivators = document.querySelectorAll('.header__search-link');
for(let i = 0; i < searchActivators.length; i++) searchActivators[i].addEventListener('click', async function(e) {
    e.preventDefault();
    
    const actives = document.querySelectorAll('.menu-popup--visible');
    actives.forEach(active => active.classList.remove('menu-popup--visible'));

    const header = document.querySelector('.shopify-section--header');
    setTimeout(() => header.removeAttribute('data-menu'), 500);
    
    document.querySelector('.menu-popup--search').classList.add('menu-popup--visible');
    document.body.classList.add('modal-open');

    document.querySelector('.menu-popup--search .search-input').focus();

    try {
        if(typeof performSearch == 'undefined') {
            let src = document.querySelector('.menu-popup--search').getAttribute('data-src');
            await loadScript(src);
        }
        
    } catch (e) {
        console.log(e);
    }
});

let menuActivators = document.querySelectorAll('.menu-popup__activator');
for(let i = 0; i < menuActivators.length; i++) menuActivators[i].addEventListener('click', function(e) {
    e.preventDefault();
    const target = this.getAttribute('data-target');
    const header = document.querySelector('.shopify-section--header');
    const menu = document.querySelector('.menu-popup[data-id="' + target + '"]');
    const navigation = document.querySelectorAll('.site-header__nav');
    [].map.call(navigation, (nav) => {
        nav.querySelector('ul').style.display = 'none';
    });

    if(!menu) return;

    if(menu.classList.contains('menu-popup--visible')) {
        menu.classList.remove('menu-popup--visible');
        menu.setAttribute('aria-selected', 'false');
        menu.setAttribute('tabindex', '-1');
        setTimeout(() => header.removeAttribute('data-menu'), 500);
        document.body.classList.remove('modal-open');
        return;
    }

    
    const actives = document.querySelectorAll('.menu-popup--visible');
    for(let i = 0; i < actives.length; i++) {
        actives[i].classList.remove('menu-popup--visible');
        actives[i].setAttribute('aria-selected', 'false');
        actives[i].setAttribute('tabindex', '-1');
        menu.setAttribute('aria-selected', 'false');
        menu.setAttribute('tabindex', '-1');
    }
    
    if(actives.length > 0) {
        setTimeout(() => {
            header.setAttribute('data-menu', target);
            setTimeout(() => {
                menu.classList.add('menu-popup--visible');
                menu.setAttribute('aria-selected', 'true');
                menu.setAttribute('tabindex', '0');
            }, 5);
        }, 300);
    } else {
        header.setAttribute('data-menu', target);
        document.body.classList.add('modal-open');
        setTimeout(() => {
            menu.classList.add('menu-popup--visible');
            menu.setAttribute('aria-selected', 'true');
            menu.setAttribute('tabindex', '0');
        }, 5);
    }

    if(menu.classList.contains('menu-popup--shop')){
        menu.querySelector('.slider').removeAttribute('aria-hidden');
            let headerSlides = menu.querySelectorAll('.slide:not(.product-unit)');
            [].map.call(headerSlides, (slide) => {
                slide.setAttribute('tabindex','0');
            });
        }

    const func = menu.getAttribute('data-func');
    if(func && typeof window[func] === 'undefined') {
        let src = menu.getAttribute('data-src');
        loadScript(src);
    }
});

let menuDeactivators = document.querySelectorAll('.menu-close--shop, .menu-close--mobile-menu, .menu-close--discover, .menu-close--search');
menuDeactivators.forEach(menuDeactivator => menuDeactivator.addEventListener('click', function() {
    let menuPopup = this.closest('.menu-popup');
    
    if(menuPopup){
        if(menuPopup.classList.contains('menu-popup--shop')){    
            menuPopup.querySelector('.slider').setAttribute('aria-hidden','true');
            let headerSlides = menuPopup.querySelectorAll('.slide');
            [].map.call(headerSlides, (slide) => {
                slide.setAttribute('tabindex','-1');
            });
        }    
    }
    if(menuPopup){
        menuPopup.classList.remove('menu-popup--visible');
        menuPopup.setAttribute('aria-selected','false');
        menuPopup.setAttribute('tabindex','-1');
    }

    const header = document.querySelector('.shopify-section--header');
    if (window.innerWidth > 900) {
        setTimeout(() => header.removeAttribute('data-menu'), 500);
        const menuPopupActivator = menuPopup.parentNode.querySelector('.menu-popup__activator');
        if(menuPopup) menuPopupActivator.setAttribute('aria-selected','false');
    } else {
        header.removeAttribute('data-menu');
    }
    
    document.body.classList.remove('modal-open');

    const navigation = document.querySelectorAll('.site-header__nav');
    [].map.call(navigation, (nav) => {
        nav.querySelector('ul').style.display = 'flex';
    });
    if(this.classList.contains('menu-close--mobile-menu')){
        document.querySelector('.mobile-menu__activator.burger-link').focus();
    }
}));

let subnavActivators = document.querySelectorAll('.subnav__activator');
for(let i = 0; i < subnavActivators.length; i++) subnavActivators[i].addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.closest('.subnav__container').classList.toggle('site-header__dropdown--active');
    if(this.closest('.subnav__container').classList.contains('site-header__dropdown--active')) {
        this.setAttribute('aria-expanded', 'true');
    } else {
        this.setAttribute('aria-expanded', 'false');
    }
});

let notifiactionsActivators = document.querySelectorAll('.header__notifications-link');
let notifiactionPopup = document.querySelector('.notifications-popup');
let previousElement = ( document.activeElement || document.body );
if(notifiactionsActivators.length > 0 && notifiactionPopup) {
    let seenNotifications = localStorage.getItem('notificationsSeen');
    if(seenNotifications === null) seenNotifications = [];
    else seenNotifications = JSON.parse(seenNotifications);

    let activeNotifications = [];
    const notifications = document.querySelectorAll('.notifications-popup .notification');
    if(notifications.length > 0) notifications.forEach(notification => activeNotifications.push(notification.getAttribute('data-id')));

    let unseenNotifications = 0;
    activeNotifications.forEach(activeNotification => {
        if(seenNotifications.indexOf(activeNotification) === -1) unseenNotifications++;
    });

    if(unseenNotifications > 0) document.body.classList.add('notifications-unread');

    notifiactionsActivators.forEach(notifiactionsActivator => notifiactionsActivator.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeAllDropdowns();
        notifiactionPopup.classList.add('notifications-popup--active');
        notifiactionPopup.setAttribute('role', 'dialog'); 
        notifiactionPopup.setAttribute('aria-modal', 'true');              
        setTimeout(() => {
            localStorage.setItem('notificationsSeen', JSON.stringify(activeNotifications));
            document.body.classList.remove('notifications-unread');
        }, 500);
        e.target.focus();
        previousElement = ( document.activeElement || document.body );
        if (notifiactionPopup.classList.contains('notifications-popup--active')) {
            document.querySelector('.menu-close--notifications').focus();
        } else {
            document.querySelector('#shop__mobile_tab').focus();
        }
        
    }));    
    notifiactionPopup.querySelector('.menu-close--notifications').addEventListener('click', function(e) {
        e.preventDefault();
        notifiactionPopup.classList.remove('notifications-popup--active');
        previousElement.focus();
            previousElement = null;
    });
     notifiactionPopup.addEventListener('keydown', function(e) {
        if(e.key == 'Escape') {
            e.preventDefault();
            notifiactionPopup.classList.remove('notifications-popup--active');
        let previousElement = ( document.activeElement || document.body );
            previousElement.focus();
            previousElement = null;
        }
    });
}

let notificationsPopup = document.querySelector('.notifications-popup');
if(notificationsPopup) notificationsPopup.addEventListener('click', (e) => e.stopPropagation());

const mobileMenuActivator = document.querySelector('.mobile-menu__activator');
if(mobileMenuActivator) mobileMenuActivator.addEventListener('click', async function(e) {
    e.preventDefault();
    if(typeof openMenu == 'undefined') await loadScript(scripts.menu);
    const navigation = document.querySelectorAll('.site-header__nav');
    [].map.call(navigation, (nav) => {
        nav.querySelector('ul').style.display = 'none';
    });
    openMenu('shop');
    document.querySelector('#shop__mobile_tab').focus();
});

/*move notifictions modal .notifications-popup, append right after to .header__notifications-link element*/
window.addEventListener("load", () => {
    const notificationsPopup = document.querySelector('.notifications-popup');
    const headerNotificationsLink = document.querySelector('.header__notifications-link');
    if(notificationsPopup && headerNotificationsLink) {
        headerNotificationsLink.insertAdjacentElement('afterend', notificationsPopup);
    }
});
const notificationsContainer = document.querySelector('.notifications-popup');
const notificationsContainerActive = document.querySelector('.notifications-popup--active');
const notifyButtonClose = document.querySelector('.menu-close--notifications');

document.addEventListener('keydown', function(event) {
  // Check if the target element has the class 'notifications-popup--active'
  if (event.target === notificationsContainer) {
    // Set focus on the close button
    notifyButtonClose.focus();
  }
});

if(notificationsContainer.querySelector('.notification > p > a') == null){
  var firstFocusableElement = notificationsContainer.querySelector('.menu-close--notifications');
} else {
  var firstFocusableElement = notificationsContainer.querySelector('.notification > p > a');
}

const lastFocusableElement = notificationsContainer.querySelector('.menu-close--notifications');

  // Trap keyboard focus by moving focus to the first or last focusable element when the user tries to tab (or "backwards" tab) past them.
  notificationsContainer.addEventListener('keydown', function(e) {
    if(e.target == firstFocusableElement && e.key == 'Tab' && e.shiftKey) {
      e.preventDefault();
      lastFocusableElement.focus();
    } else if(e.target == lastFocusableElement && e.key == 'Tab' && !e.shiftKey) {
      e.preventDefault();
      firstFocusableElement.focus();
    }
  });    

/*move notifictions modal ".menu-popup--shop", append right after to ".site-header__menu-item > a[data-target="shop"]" element*/
window.addEventListener("load", () => {
    const menuPopup = document.querySelector('.menu-popup.menu-popup--shop');
    const headerShopLink = document.querySelector('#shopify-section-header ul.header__nav.header__nav--full > li a[data-target="shop"]');
    if(menuPopup && headerShopLink) {
        headerShopLink.insertAdjacentElement('afterend', menuPopup);
    }

    function trappingMobileMenuFocus(){
        let previousElement = ( document.activeElement || document.body );
        const firstFocusableElement = document.querySelector('#shop__mobile_tab');
        const lastFocusableElement = document.querySelector('#discover__mobile_tabpanel > div > div > ul > li.slide-menu-item.slide-menu-item--edits > div:nth-child(3) > a');
        const qvBody = document.querySelector('header.mobile-menu');
        qvBody.addEventListener('keydown', function(e) {
        if(e.target === firstFocusableElement && e.key === 'Tab' && e.shiftKey) {
            e.preventDefault();
            lastFocusableElement.focus();
        } else if(e.target === lastFocusableElement && e.key === 'Tab' && !e.shiftKey) {
            e.preventDefault();
            firstFocusableElement.focus();
        }
        });
    
        firstFocusableElement.addEventListener('click', function(e) {
            previousElement.focus();
            previousElement = null;
            });
    }
    setTimeout(() => {
        trappingMobileMenuFocus();
    }, 10);
});


// ADA swatches keyboard navigation
function customMobileTabNavigation(){
  const swatchesKeyContainerUnit = document.querySelectorAll('#nav-header-bottom'); 
  [].map.call(swatchesKeyContainerUnit, (container => {
    customMobileKeyNav(container);
  }));     
}
  setTimeout(()=>{
      customMobileTabNavigation();
  }, 500)

/* GENERAL RADIO BUTTONS KAYBOARD NAVIGATION */
function customMobileKeyNav(container) {
    
        
  container.addEventListener('keyup', function(e) {
      console.log(e.target);
      let colorButtons = container.querySelectorAll('.menu-popup__activator');
      [].map.call(colorButtons, (colorButton) => {
          colorButton.addEventListener('click', function(e) {
              selectColorButton(e.target);
          });
      });


      
        switch(e.key) {
          case 'ArrowUp':
          case 'ArrowLeft':
            e.preventDefault();
            selectPreviousColorButton(e.target);
            break;
            
          case 'ArrowDown':
          case 'ArrowRight':
            e.preventDefault();
            selectNextColorButton(e.target);
            break;
            
          case ' ':
            selectColorButton(e.target);
            break;
        }
        // secondary functions
      function selectPreviousColorButton(colorButton) {
          let index = Array.prototype.slice.call(colorButtons).indexOf(colorButton);
          
          if(index > 0) {
            selectColorButton(colorButtons[index - 1]);
          } else {
            selectColorButton(colorButtons[colorButtons.length - 1]);
          }
        }
        
        function selectNextColorButton(colorButton) {
          let index = Array.prototype.slice.call(colorButtons).indexOf(colorButton);
          
          if(index < colorButtons.length - 1) {
            selectColorButton(colorButtons[index + 1]);
          } else {
            selectColorButton(colorButtons[0]);
          }
        }
        
        function selectColorButton(colorButton) {
          // Deselect all other color buttons 
          colorButtons.forEach(function(otherColorButton) {
            otherColorButton.setAttribute('tabindex', '-1');
            otherColorButton.setAttribute('aria-checked', false);
          });
          
          // Select the provided color button
          colorButton.setAttribute('tabindex', '0');
          colorButton.setAttribute('aria-checked', true);
          colorButton.focus();
        }
      });
}

let moreButton = document.querySelector('.moreButton');
moreButton.addEventListener('click', function() {
	let moreButtonWrap = document.querySelector('.moreBTN_wrap');
	moreButtonWrap.classList.add('showFull');
});