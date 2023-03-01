"use strict";

// const wishlistPopup = document.querySelector('.wishlist__popup');

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

    wishlistContainer.setAttribute('data-count', wishlist.length);
}

function showWishlistPopup(item, status) {
    if(!wishlistPopup) return;

    wishlistPopup.setAttribute('data-status', status);
    
    wishlistPopup.classList.add('wishlist__popup--active');

    setTimeout(function() {
        wishlistPopup.classList.remove('wishlist__popup--active');
    }, 3000);
}

function processWishlistClick(target) {
    const btn = target;

    let container = target.closest('.shopify-product-form, .product-unit');
    let select = container.querySelector('.variant-select');

    if(!select) return btn.classList.remove('wishlist__button--loading');

    let option = select.options[select.selectedIndex];
    let vid = select.value * 1;

    // if(btn.classList.contains('add-to-wishlist__btn--variant')) {
    //     vid = btn.getAttribute('data-vid') * 1;
    //     option = select.querySelector('option[value="' + vid + '"]');
    // }

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

    // const img = wishlistPopup.querySelector('.wishlist__item-image .image-ratio-container');
    // if(!wishlistPopup.classList.contains('wishlist__popup--active')) img.innerHTML = get_image(obj.iu, '94px', false);

    if(btn.classList.contains('wishlist__button--added')) {
        _swat.removeFromWishList( obj, function() {
            btn.setAttribute('title', 'Add to Wishlist');
            btn.classList.remove('wishlist__button--added');

            // img.innerHTML = get_image(obj.iu, '94px', false);
            // showWishlistPopup(obj, 'removed');
            btn.classList.remove('wishlist__button--loading');

            updateWishlist();
        } );
    } else {
        _swat.addToWishList( obj, function() {
            btn.setAttribute('title', 'Remove from Wishlist');
            btn.classList.add('wishlist__button--added');

            // img.innerHTML = get_image(obj.iu, '94px', false);
            // showWishlistPopup(obj, 'added');
            btn.classList.remove('wishlist__button--loading');

            updateWishlist();
        } );
    }
}

document.addEventListener('click', function(e) {
    if(e.target) {
        if(e.target.classList.contains('whishlist__prod-remove')) {
            e.preventDefault();
            let cont = e.target.closest('.wishlist__prod');
            if(cont) {
                let json = JSON.parse(cont.querySelector('.wishlist__prod-json').innerHTML);
                cont.classList.add('wishlist__prod--loading');

                const img = wishlistPopup.querySelector('.wishlist__item-image .image-ratio-container');
                img.innerHTML = get_image(json.iu, '94px', false);

                _swat.removeFromWishList( json, function() {
                    showWishlistPopup(json, 'removed');
                    updateWishlist();
                } );
            }
        }
    }
});

document.addEventListener('variantChange', function(e) {
    let variant = e.detail.variant;
    let selector = e.detail.selector;
    let found = false;
    for(let i = 0; i < wishlist.length; i++) {
        if(wishlist[i].epi == variant.id) {
            found = true;
            break;
        }
    }

    let container = selector.variantIdField.closest('.product-template-form, .product-unit, .product-list-item');
    if(!container) return;
    let btn = container.querySelector('.add-to-wishlist__btn');

    if(!btn) return;
    btn.setAttribute('data-vid', variant.id);

    if(found) {
        btn.setAttribute('title', 'Remove from Wishlist');
        btn.classList.add('add-to-wishlist__btn--added');
    } else {
        btn.setAttribute('title', 'Add to Wishlist');
        btn.classList.remove('add-to-wishlist__btn--added');
    }
});