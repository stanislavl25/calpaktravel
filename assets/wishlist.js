"use strict";

const wishlistPopup = document.querySelector('.wishlist__popup');
let popupTimeout = false;

function createWishlistItem(item, itemsList) {
    let newItem = document.createElement('div');
    newItem.classList.add('wishlist__prod');

    fetch(`${item.du}?view=unit-btn`).then(response => response.text()).then(data => {
        newItem.innerHTML = data;
        const productUnit = newItem.querySelector('.product-unit');
        productUnit.classList.add('product-unit--single');
        
        const wishlistButton = productUnit.querySelector('.wishlist__button');
        wishlistButton.setAttribute('title', 'Remove from Wishlist');
        wishlistButton.classList.add('wishlist__button--added');
        
        const productLinks = productUnit.querySelectorAll('.product-link');
        productLinks.forEach(productLink => productLink.setAttribute('href', item.du));

        const allProductsImages = productUnit.querySelectorAll('.product-unit__image img');
            allProductsImages.forEach(allProductsImage => allProductsImage.setAttribute('sizes', '(min-width: 1180px) 20vw, (min-width: 901px) 25vw, (min-width: 651px) 33.33vw, 50vw'));

        if(productUnitsObserver && productUnit) productUnitsObserver.observe(productUnit);

        const qv = productUnit.querySelector('.quick-view__link');
        if(qv) qv.addEventListener('click', quickViewClick);
    });

    itemsList.appendChild(newItem);
}

function populateWishlist() {
    const itemsList = document.querySelector('.wishlist__items');
    if(!itemsList) return;

    itemsList.innerHTML = '';
    wishlist.forEach(item => createWishlistItem(item, itemsList));

    setTimeout(showLoginForm, 3000);

    wishlistContainer.setAttribute('data-count', wishlist.length);
}

function showWishlistPopup(item, status) {
    if(!wishlistPopup) return;

    const img = wishlistPopup.querySelector('.wishlist__popup-image-cont');
    if(img) img.innerHTML = getImage(item.iu, '110px', "Product image");

    wishlistPopup.setAttribute('data-status', status);
    
    if(popupTimeout !== false) clearTimeout(popupTimeout);
    popupTimeout = setTimeout(function() {
        wishlistPopup.removeAttribute('data-status');
    }, settings.wishlistTimeout * 1000 );
}

function processWishlistClick(target, data = false) {
    const btn = target;
    const upd = document.querySelector('.pdp__floating-submit-inner .pdp__submit-row .button--pdp__wishlist');
    let container = target.closest('.shopify-product-form, .product-unit');
    let select = container.querySelector('.variant-select');

    if(!select) return btn.classList.remove('wishlist__button--loading');

    let option = select.options[select.selectedIndex];
    let vid = select.value * 1;

    const pid = container.getAttribute('data-id') * 1;

    const title = 'Product';//select.getAttribute('data-title');
    const handle = container.getAttribute('data-handle');
    const image = option.getAttribute('data-image');

    let option1 = option.getAttribute('data-option1');
    let option2 = false;
    if(option.hasAttribute('data-option2')) option2 = option.getAttribute('data-option2');

    const price = option.getAttribute('data-price') / 100;
    const optionName = option.innerHTML.trim();
    let variants = {};

    variants[optionName] = vid;

    const obj = {
        _cv: true,
        pt: title,
        dt: title,
        rc: 'default',
        du: "https://www.calpaktravel.com/products/" + handle + '/' + option1 + (option2 && option2 != 'false' ? `,${option2}`: ''),
        empi: pid,
        epi: vid,
        et: _swat.EventTypes.addToWishlist,
        iu: image,
        ri: SwymPageData.ri,
        pr: price,
        ru: "https://www.calpaktravel.com/products/" + handle + '/' + option1 + (option2 && option2 != 'false' ? `,${option2}`: ''),
        type: "product-variant",
        variants: [variants],
        vi: optionName
    };

    if(btn.classList.contains('wishlist__button--added')) {
        removeFromWishlist(obj, () => {
            btn.setAttribute('title', 'Add to Wishlist');
            btn.classList.remove('wishlist__button--added');
            btn.classList.remove('wishlist__button--loading');
            upd.setAttribute('title', 'Add to Wishlist');
            upd.classList.remove('wishlist__button--added');
        });
    } else {
        addToWishlist(obj, () => {
            btn.setAttribute('title', 'Remove from Wishlist');
            btn.classList.add('wishlist__button--added');
            btn.classList.remove('wishlist__button--loading');
            upd.setAttribute('title', 'Remove from Wishlist');
            upd.classList.add('wishlist__button--added');
            console.log('ADDED')

        });
    }

}

function removeFromWishlist(obj, callback = false) {
    _swat.removeFromWishList( obj, function() {
        showWishlistPopup(obj, 'removed');
        updateWishlist();
        if(callback !== false) callback();
    } );
}

function addToWishlist(obj, callback = false, showPopup = true) {
    _swat.addToWishList( obj, function() {
        if(showPopup) showWishlistPopup(obj, 'added');
        updateWishlist();
        if(callback !== false) callback();
    } );
}

const closeLoginFormEls = document.querySelectorAll('.login-popup .popup-close, .login-popup__overlay');
if(closeLoginFormEls.length > 0) closeLoginFormEls.forEach(closeLoginFormEl => closeLoginFormEl.addEventListener('click', closeLoginForm));

function showLoginForm() {
    const cont = document.querySelector('.login-popup__container');
    if(cont) cont.classList.add('login-popup__container--active');
}

function closeLoginForm() {
    const cont = document.querySelector('.login-popup__container');
    if(cont) cont.classList.remove('login-popup__container--active');
}