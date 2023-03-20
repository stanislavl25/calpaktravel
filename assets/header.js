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

    if(!menu) return;

    if(menu.classList.contains('menu-popup--visible')) {
        menu.classList.remove('menu-popup--visible');
        setTimeout(() => header.removeAttribute('data-menu'), 500);
        document.body.classList.remove('modal-open');
        return;
    }

    
    const actives = document.querySelectorAll('.menu-popup--visible');
    for(let i = 0; i < actives.length; i++) {
        actives[i].classList.remove('menu-popup--visible');
    }
    
    if(actives.length > 0) {
        setTimeout(() => {
            header.setAttribute('data-menu', target);
            setTimeout(() => {
                menu.classList.add('menu-popup--visible');
            }, 5);
        }, 300);
    } else {
        header.setAttribute('data-menu', target);
        document.body.classList.add('modal-open');
        setTimeout(() => {
            menu.classList.add('menu-popup--visible');
        }, 5);
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

    if(menuPopup) menuPopup.classList.remove('menu-popup--visible');

    const header = document.querySelector('.shopify-section--header');
    setTimeout(() => header.removeAttribute('data-menu'), 500);
    document.body.classList.remove('modal-open');
}));

let subnavActivators = document.querySelectorAll('.subnav__activator');
for(let i = 0; i < subnavActivators.length; i++) subnavActivators[i].addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.closest('.subnav__container').classList.toggle('site-header__dropdown--active');
});

let notifiactionsActivators = document.querySelectorAll('.header__notifications-link');
let notifiactionPopup = document.querySelector('.notifications-popup');
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

        setTimeout(() => {
            localStorage.setItem('notificationsSeen', JSON.stringify(activeNotifications));
            document.body.classList.remove('notifications-unread');
        }, 500);
    }));

    notifiactionPopup.querySelector('.menu-close--notifications').addEventListener('click', function(e) {
        e.preventDefault();
        notifiactionPopup.classList.remove('notifications-popup--active');
    });
}

let notificationsPopup = document.querySelector('.notifications-popup');
if(notificationsPopup) notificationsPopup.addEventListener('click', (e) => e.stopPropagation());

const mobileMenuActivator = document.querySelector('.mobile-menu__activator');
if(mobileMenuActivator) mobileMenuActivator.addEventListener('click', async function(e) {
    e.preventDefault();
    if(typeof openMenu == 'undefined') await loadScript(scripts.menu);

    openMenu('shop');
});