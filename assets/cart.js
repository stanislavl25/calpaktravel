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

    fetch('/cart/add.js', {
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
                // $('#AddToCart-product-button').addClass('unavailable');
                // setTimeout(function() {
                    // $('#AddToCart-product-button').removeClass('unavailable');
                // }, 1000);
            } else {
                alert("Error adding product!");
                // $('#AddToCart-product-button').addClass('error');
                // setTimeout(function() {
                    // $('#AddToCart-product-button').removeClass('error');
                // }, 1000);
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    })
    .then(response => {
        // console.log(response);
        if(typeof callback == 'function') callback(response);
        // document.querySelector('.mini-cart__items').innerHTML = response.sections['mini-cart-items'];
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    .then(always, always);
}

function updateCartItems(items, callback, always) {
    fetch(routes.cart_update_url + '.js', {
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
    const freeShippingIndicator = document.querySelector('.cart__free-shipping-indicator');
    if(!freeShippingIndicator) return false;

    let freeShippingPercent = 0;
    const container = freeShippingIndicator.closest('.cart__free-shipping');

    if(cart.item_count > 0) {
        const freeShippingStarts = Number(freeShippingIndicator.getAttribute('data-value'));
        if(isNaN(freeShippingStarts)) return false;

        freeShippingPercent = Math.round((cart.items_subtotal_price * 100) / freeShippingStarts);
        if(freeShippingPercent > 100) freeShippingPercent = 100;

        container.querySelector('.shipping-value').innerHTML = formatPrice((freeShippingStarts - cart.items_subtotal_price) / 100);
    }

    if(freeShippingPercent == 100) container.closest('.cart__header').setAttribute('data-status', 'success');
    else container.closest('.cart__header').setAttribute('data-status', 'progress');
    
    freeShippingIndicator.style.setProperty('--shipping-progress', `${freeShippingPercent}%`);

    return freeShippingPercent == 100;
}

function setHeaderItemCounter(cart) {
    let bag = document.querySelector('.header__bag-icon')
    
    if(cart.item_count == 0) bag.classList.remove('header__bag-icon--full');
    else bag.classList.add('header__bag-icon--full');

    bag.querySelector('.header__bag-count').innerHTML = cart.item_count;
}

function updateCart(data) {
    document.querySelector('.cart__items-container').innerHTML = data.sections['cart-items'];
    const cart = JSON.parse(stripHTML(data.sections['cart-json']));
    
    const cartContainer = document.querySelector('.cart__container, .cart-page');
    
    if(cart.item_count == 0) cartContainer.classList.add('cart__container--empty');
    else cartContainer.classList.remove('cart__container--empty');

    setHeaderItemCounter(cart);
    
    let freeShipping = setFreeShippingProgress(cart);

    let totalPrice = cart.total_price;
    if(!freeShipping) totalPrice += 795;

    if(cart.item_count > 0) cartContainer.querySelector('.cart__count').innerHTML = cart.item_count;
    cartContainer.querySelector('.cart__total-row--subtotal .cart__total-value').innerHTML = formatPrice(cart.items_subtotal_price / 100);
    cartContainer.querySelector('.cart__payments-amnt').innerHTML = formatPrice(totalPrice / 4 / 100);

    if(totalPrice * 1 <= 5000) cartContainer.querySelector('.cart__4-payments').classList.add('cart__4-payments--limit');
    else cartContainer.querySelector('.cart__4-payments').classList.remove('cart__4-payments--limit');

    cartContainer.querySelector('.cart__total-row--total .cart__total-value').innerHTML = formatPrice(totalPrice / 100);
}

function closeCart() {
    const cartContainer = document.querySelector('.cart__container');
    cartContainer.classList.remove('cart__container--visible');
    setTimeout(() => {
        cartContainer.classList.remove('cart__container--active');
        document.body.classList.remove('modal-open');
    }, 310);
}

function openCart() {
    const cartContainer = document.querySelector('.cart__container');
    if(cartContainer.classList.contains('cart__container--visible')) return;

    cartContainer.classList.add('cart__container--active');
    setTimeout(() => {
        cartContainer.classList.add('cart__container--visible');
    }, 10);
    document.body.classList.add('modal-open');
}

const closeCartLinks = document.querySelectorAll('.close-button--cart, .cart__overlay, .cart__empty-continue-button');
if(closeCartLinks.length > 0) closeCartLinks.forEach(closeCartLink => closeCartLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeCart();
}));

window.addEventListener("click", async (e) => {
    if(e.target.classList.contains('cart__item-remove')) {
        e.preventDefault();

        const cartItem = e.target.closest('.cart__item');
        if(!cartItem) return;

        cartItem.classList.add('cart__item--removing');

        let updates = {};
        updates[cartItem.getAttribute('data-key')] = 0;

        updateCartItems(updates, function(data) {
            updateCart(data);
        });
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

        let updates = {};
        updates[cartItem.getAttribute('data-key')] = qty;

        updateCartItems(updates, function(data) {
            updateCart(data);
        });

        valueInput.value = qty;
    } else if(e.target.classList.contains('cart__item-wishlist')) {
        e.preventDefault();

    }
});