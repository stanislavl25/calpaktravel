"use strict";

function addToCart(variant_id, quantity, callback, always, final_sale = false, preorder = false) {
    if(typeof final_sale == 'undefined') final_sale = false;
    if(typeof preorder == 'undefined') preorder = false;

    let items = [{
        id: variant_id,
        quantity: quantity,
        properties: {}
    }];

    if(final_sale) items[0].properties['_final-sale'] = true;
    if(preorder) items[0].properties['_preorder'] = preorder;

    let formData = {
        cb: Date.now(),
        items: items,
        sections: 'cart-items,cart-json'
    };

    if(typeof always != 'function') always = () => {};

    fetch(`${routes.cart_add_url}.js`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if(!response.ok) {
            if(response.status == 422) {
                alert("Product not avalable!");
            } else {
                alert("Error adding product!");
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    })
    .then(async response => {
        if(typeof gwpConfig != 'undefined') {
            if(typeof getGWP == 'undefined') await loadScript(scripts.gwp);
            response = await checkGWP(response);
        }

        if(typeof callback == 'function') callback(response);
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    .then(always, always);
}

function changeCartItem(key, qty) {
    return fetch(`${routes.cart_change_url}.js`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cb: Date.now(),
            id: key,
            quantity: qty,
            sections: 'cart-items,cart-json'
        })
    }).then(response => {
        if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return response.json();
    });
}

function updateCartItems(items, callback, always) {
    fetch(`${routes.cart_update_url}.js`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            updates: items,
            sections: 'cart-items,cart-json'
        })
    })
    .then(response => {
        if(!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return response.json();
    })
    .then(response => {
        if(typeof callback == 'function') callback(response);
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    .then(always, always)
    // Extend - Dispatch event on remove product
    .then(() => {
        window.dispatchEvent(new Event('refreshAjaxCart'))
    });
    // Extend - End code
}

function setFreeShippingProgress(cart) {
    const cartContainers = document.querySelectorAll('.cart-page, .cart__body');
    let freeShippingPercent = 0;
    const freeShippingStarts = settings.freeShipping;

    if(cart.requires_shipping) {
        if(cart.item_count > 0) {
            if(isNaN(freeShippingStarts)) return false;

            freeShippingPercent = Math.round((cart.items_subtotal_price * 100) / freeShippingStarts);
            if(freeShippingPercent > 100) freeShippingPercent = 100;
        }
    } else {
        freeShippingPercent = 100;
    }

    cartContainers.forEach(cartContainer => {
        const cartHeader = cartContainer.querySelector('.cart__header');
        if(cartHeader) {
            if(freeShippingPercent == 100) cartHeader.setAttribute('data-status', 'success');
            else cartHeader.setAttribute('data-status', 'progress');
        }

        const freeShippingIndicator = cartContainer.querySelector('.cart__free-shipping-indicator');
        if(!freeShippingIndicator) return false;

        freeShippingIndicator.style.setProperty('--shipping-progress', `${freeShippingPercent}%`);

        if(freeShippingPercent > 0) cartContainer.querySelector('.shipping-value').innerHTML = formatPrice((freeShippingStarts - cart.items_subtotal_price) / 100);
    });

    return freeShippingPercent == 100;
}

function setHeaderItemCounter(cart) {
    let bag = document.querySelector('.header__bag-icon')
    
    if(cart.item_count == 0) bag.classList.remove('header__bag-icon--full');
    else bag.classList.add('header__bag-icon--full');

    bag.querySelector('.header__bag-count').innerHTML = cart.item_count;
}

function updateCartGWPs() {
    const cartGWPItems = document.querySelectorAll('.cart__items-container .cart__item--gwp:not(.cart__item--gwp-loaded)');
    cartGWPItems.forEach(cartGWPItem => {
        if(typeof gwpConfig != 'undefined') {
            for(let i = 0; i < gwpConfig.products.length; i++) {
                const product = gwpConfig.products[i];

                cartGWPItem.querySelector('.cart__item-title').innerHTML = product.title;
                cartGWPItem.querySelector('.cart__item-image .ratio-container').innerHTML = getImage(product.image, '180px', `${product.title} picture`);
                cartGWPItem.querySelector('.cart__item-description').innerHTML = product.text;
            }
            cartGWPItem.classList.add('cart__item--gwp-loaded');
        } else {
            changeCartItem(cartGWPItem.getAttribute('data-key'), 0);
            cartGWPItem.remove();
        }
    });
}

function updateCart(data, jsonIncluded = false) {
    document.querySelector('.cart__items-container').innerHTML = data.sections['cart-items'];
    let cart;
    if(jsonIncluded) cart = data;
    else cart = JSON.parse(stripHTML(data.sections['cart-json']));
    
    const cartContainer = document.querySelector('.cart__container, .cart-page');
    
    if(cart.item_count == 0) cartContainer.classList.add('cart__container--empty');
    else cartContainer.classList.remove('cart__container--empty');

    setHeaderItemCounter(cart);
    
    let freeShipping = setFreeShippingProgress(cart);

    let totalPrice = cart.total_price;
    if(!freeShipping) totalPrice += 795;

    cartContainer.querySelector('.cart__count').innerHTML = cart.item_count;
    cartContainer.querySelector('.cart__total-row--subtotal .cart__total-value').innerHTML = formatPrice(cart.items_subtotal_price / 100);
    cartContainer.querySelector('.cart__payments-amnt').innerHTML = formatPrice(totalPrice / 4 / 100);

    if(totalPrice * 1 <= 5000) cartContainer.querySelector('.cart__4-payments').classList.add('cart__4-payments--limit');
    else cartContainer.querySelector('.cart__4-payments').classList.remove('cart__4-payments--limit');

    cartContainer.querySelector('.cart__total-row--total .cart__total-value').innerHTML = formatPrice(totalPrice / 100);

    updateCartGWPs();
}

function closeCart() {
    const cartContainer = document.querySelector('.cart__container');
    if(!cartContainer) return;
    cartContainer.classList.remove('cart__container--visible');
    setTimeout(() => {
        cartContainer.classList.remove('cart__container--active');
        document.body.classList.remove('modal-open');
    }, 310);
}

function openCart() {
    const cartContainer = document.querySelector('.cart__container');
    if(!cartContainer || cartContainer.classList.contains('cart__container--visible')) return;

    cartContainer.classList.add('cart__container--active');
    setTimeout(() => {
        cartContainer.classList.add('cart__container--visible');
    }, 10);
    document.body.classList.add('modal-open');

    updateCartGWPs();
    
    if(isset(localStorage.getItem('guest_checkout')) && localStorage.getItem('guest_checkout')) {
        document.querySelector('.cart__footer .button--checkout').setAttribute('href', '/checkout');
    }

    if(delayed_checkout_buttons && !document.querySelector('#dynamic-checkout-cart')) document.querySelector('#shopify-section-cart .cart__extra-checkout').innerHTML = delayed_checkout_buttons;
}

const closeCartLinks = document.querySelectorAll('.close-button--cart, .cart__overlay, .cart__empty-continue-button');
if(closeCartLinks.length > 0) closeCartLinks.forEach(closeCartLink => closeCartLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeCart();
}));

let wishlistNotificationTimeout = false;
let wishlistFromCartItem = false;
window.addEventListener("click", async (e) => {
    if(e.target.classList.contains('cart__item-remove')) {
        e.preventDefault();

        const cartItem = e.target.closest('.cart__item');
        if(!cartItem) return;

        cartItem.classList.add('cart__item--removing');

        let data = await changeCartItem(cartItem.getAttribute('data-key'), 0);

        if(typeof gwpConfig != 'undefined') {
            if(typeof getGWP == 'undefined') await loadScript(scripts.gwp);
            data = await checkGWP(data);

            updateCart(data);
        } else {
            updateCart(data, true);
        }
    } else if(e.target.classList.contains('qty-button')) {
        e.preventDefault();

        const container = e.target.closest('.qty-selector');
        if(!container) return;

        const cartItem = container.closest('.cart__item');

        const valueInput = container.querySelector('input[name="qty"]');
        let qty = Number(valueInput.value);
        if(isNaN(qty)) return;

        if(e.target.classList.contains('qty-button--less')) {
            if(qty > 1) qty--;
            else {
                qty = 0;
                cartItem.classList.add('cart__item--removing');
            }
        } else qty++;

        valueInput.value = qty;

        let data = await changeCartItem(cartItem.getAttribute('data-key'), qty);

        if(typeof gwpConfig != 'undefined') {
            if(typeof getGWP == 'undefined') await loadScript(scripts.gwp);
            data = await checkGWP(data);

            updateCart(data);
        } else {
            updateCart(data, true);
        }
    } else if(e.target.classList.contains('cart__item-wishlist')) {
        e.preventDefault();

        cartItemMoveToWishlist(e.target);
    } else if(e.target.classList.contains('cart__undo-wishlist') && wishlistFromCartItem !== false) {
        const cartContainer = document.querySelector('.cart__container');
        const btn = e.target;
        btn.classList.add('cart__undo-wishlist--working');
        addToCart(wishlistFromCartItem.variant_id, wishlistFromCartItem.qty, (data) => {
            updateCart(data);
            
            cartContainer.classList.remove('cart__container--wishlist');
        }, () => {
            btn.classList.remove('cart__undo-wishlist--working');
        }, wishlistFromCartItem.final, wishlistFromCartItem.preorder);
    }
});

window.addEventListener("load", () => {
    if(document.body.classList.contains('template-cart')) {
        updateCartGWPs();
        if(isset(localStorage.getItem('guest_checkout')) && localStorage.getItem('guest_checkout')) {
            document.querySelector('.cart-sidebar .button--checkout').setAttribute('href', '/checkout');
        }
    }
});

async function cartItemMoveToWishlist(target) {
    const cartContainer = document.querySelector('.cart__container');

    if(typeof processWishlistClick == 'undefined') await Promise.all([
        loadScript(scripts.wishlist),
        loadStyle(styles.wishlist),
        loadStyle(styles.wishlistPopup)
    ]);

    const item = target.closest('.cart__item'),
        title = item.querySelector('.cart__item-title').innerHTML,
        option1 = item.querySelector('.cart__item-option--1').innerHTML,
        pid = item.getAttribute('data-id'),
        vid = item.getAttribute('data-variant'),
        image = item.querySelector('.cart__item-image img').getAttribute('src'),
        price = item.querySelector('.cart__item-price').getAttribute('data-price') / 100,
        handle = item.getAttribute('data-handle');

    wishlistFromCartItem = {
        variant_id: vid,
        qty: item.querySelector('input[name="qty"]').value * 1,
        preorder: item.hasAttribute('data-preorder')?item.getAttribute('data-preorder'):false,
        final: item.hasAttribute('data-final')
    };

    let option2 = item.querySelector('.cart__item-option--2'),
        variants = {};

    if(option2) option2 = option2.innerHTML;
    const optionName = option1 + (option2?` / ${option2}`:'');
    variants[optionName] = vid;

    const url = "https://www.calpaktravel.com/products/" + handle + '/' + handleize(option1) + (option2 && option2 != 'false' ? `,${handleize(option2)}`: '');

    const obj = {
        _cv: true,
        pt: title,
        dt: title,
        rc: 'default',
        du: url,
        empi: pid,
        epi: vid,
        et: _swat.EventTypes.addToWishlist,
        iu: image,
        ri: SwymPageData.ri,
        pr: price,
        ru: url,
        type: "product-variant",
        variants: [variants],
        vi: optionName
    };

    addToWishlist(obj, false, false);
    item.querySelector('.cart__item-remove').click();

    const wishlistNotifImg = cartContainer.querySelector('.cart__wishlist-item-image');

    if(wishlistNotifImg) wishlistNotifImg.innerHTML = `<img src="${image}" sizes="50px" srcset="${lazyloadImageSrcset(image)}" alt="${title} image">`;

    const wishlistNotifTitle = cartContainer.querySelector('.cart__wishlist-item-title');
    wishlistNotifTitle.innerHTML = `<a href="${url}">${title}</a> moved to wishlist.`;
    cartContainer.classList.add('cart__container--wishlist');

    if(wishlistNotificationTimeout) clearTimeout(wishlistNotificationTimeout);
    wishlistNotificationTimeout = setTimeout(() => {
        cartContainer.classList.remove('cart__container--wishlist');
    }, settings.cartWishlistTimeout * 1000);
}