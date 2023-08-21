"use strict";
let cartShippingGift = document.querySelector('.cart__gamification-gifts');

function addToCart(variant_id, quantity, callback, always, final_sale = false, preorder = false) {
    if(typeof final_sale == 'undefined') final_sale = false;
    if(typeof preorder == 'undefined') preorder = false;

    let items = typeof variant_id == 'object' ? variant_id : [{
        id: variant_id,
        quantity: quantity,
        properties: {}
    }];

    if(final_sale) items[0].properties['_final-sale'] = true;
    if(preorder) items[0].properties['_preorder'] = preorder;

    let formData = {
        cb: Date.now(),
        items: items,
        sections: 'cart-items,cart-json,cart-pair-upsell'
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
        // if(typeof gwpConfig != 'undefined') {
        //     if(typeof getGWP == 'undefined') await loadScript(scripts.gwp);
        //     response = await checkGWP(response);
        // }

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
            sections: 'cart-items,cart-json,cart-pair-upsell'
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
            sections: 'cart-items,cart-json,cart-pair-upsell'
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
if (cartShippingGift) {
    document.querySelector('.cart__gamification').classList.add('cart__gamification--has-gifts');
}
function gamificationInit() {
    const { subtotal, goals, gifts, wrapper, limit } = settings["cartGamification"];


    document.querySelector(wrapper).innerHTML = '';
    goals.forEach( item => {
        const goalOffset = item.value / limit * 100;
        const goalTemplate = `
            <div class="cart__gamification-goal" style="left: ${goalOffset}%">
                <figure class="cart__gamification-icon ${subtotal >= item.value ? 'cart__gamification-icon--reached' : false}">
                    ${item.icon}
                </figure>
            </div>
        `;
        document.querySelector(wrapper).innerHTML += goalTemplate;
    });





    // gifts.forEach( item => {
    //     const giftTemplate = `
    //         <div class="cart__gamification-goal cart__gamification-goal--gift" style="left: 100%">
    //             <figure class="cart__gamification-icon">
    //                 ${item.icon}
    //             </figure>
    //         </div>
    //     `;
    //     document.querySelector(wrapper).innerHTML += giftTemplate;
    // });

    setGamificationProgress(subtotal * 100);

    document.addEventListener('click', event => {
        if (event.target.matches('.cart__item--gift .color-swatch')) {

            const selectedVariantId = event.target.dataset.firstVariantId;
            const currentVariant = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.variant;
            const currentId = event.target.parentNode.parentNode.parentNode.parentNode.dataset.id;

            let clean_items = {};
            clean_items[currentVariant] = 0;

            updateCartItems(clean_items, () => {
                //updateCart(data);
                const items = [{
                    id: selectedVariantId,
                    quantity: 1,
                    properties: {
                        '_gift': 'true'
                    }
                }];

                addToCart(items, 1, (data) => {
                    updateCart(data, false, false);
                    activateProductUnit(document.querySelector(".cart__item--gift .product-unit"));
                });
            });

        }
    });
}

function setFreeGiftsByProduct(items) {



    document.querySelectorAll(`.free-gift__selector`).forEach(selector => selector.classList.remove('free-gift__selector--active'));
    document.querySelector('.free-gift__announcement').classList.remove('free-gift__announcement--complete');

    // If any gift disable choose gifts
    const gifts_in_cart = items.filter( item => item.properties?._gift == 'true');
    if(gifts_in_cart.length) {

        document.querySelectorAll(`.free-gift__selector`).forEach(selector => selector.classList.add('free-gift__selector--applied'));
        document.querySelector(`.cart__gamification-gifts`).classList.add('cart__gamification-gifts--reached');
        document.querySelector('.free-gift__announcement').classList.add('free-gift__announcement--complete');

        let current_message = document.querySelector('.cart__gam-verbose').innerHTML;
        if(current_message.slice(-16) == 'and a FREE gift!'){
            if(document.querySelector('.cart__gam-verbose').innerHTML.slice(0,9) == 'Congrats!') {
                current_message = current_message
            } else {
                current_message = `Congrats!<br> ${current_message}`;
            }
        } else {
            current_message = `Congrats!<br> ${current_message.slice(0, -1)} and a FREE gift!`;
        }
        document.querySelector('.cart__gam-verbose').innerHTML = current_message;
        document.querySelector(".cart__gam-verbose--gift").innerHTML = "";
    } else {

        if(settings.cartGamification.gifts.length){
            for(let x in settings.cartGamification.gifts) {
                //const giftKey = items.find(item => item.product_id == settings.cartGamification.gifts[x].key);
                const giftKey = items.find(item => settings.cartGamification.gifts[0].keys.includes(item.product_id));
                if(giftKey){
                    try {
                        document.querySelector(`.free-gift__selector[data-key="${settings.cartGamification.gifts[x].key}"]`).classList.add('free-gift__selector--active');
                        document.querySelector(`.free-gift__selector[data-key="${settings.cartGamification.gifts[x].key}"]`).classList.remove('free-gift__selector--applied');
                        document.querySelector(`.cart__gamification-gifts`).classList.remove('cart__gamification-gifts--reached');
                        document.querySelector('.free-gift__announcement').classList.add('free-gift__announcement--complete');
                        let current_message = document.querySelector('.cart__gam-verbose').innerHTML;
                        if(current_message.slice(-16) == 'and a FREE gift!'){
                            if(document.querySelector('.cart__gam-verbose').innerHTML.slice(0,9) == 'Congrats!') {
                                current_message = `${current_message.slice(0, -1)}`;
                            } else {
                                current_message = `Congrats!<br> ${current_message}`;
                            }
                        } else {
                            current_message = `Congrats!<br> ${current_message.slice(0, -1)} and a FREE gift!`;
                        }
                        document.querySelector('.cart__gam-verbose').innerHTML = current_message;
                        document.querySelector(
                          ".cart__gam-verbose--gift"
                        ).innerHTML = "";
                        setGiftFunctions();
                    } catch {}
                }
            }
        }
    }

    /*
      // Clean gifts from cart if exists
        let clean_items = {};
        const gifts_in_cart = cartItems.filter( item => item.properties?._gift == 'true');

        gifts_in_cart.forEach( gift => {
            clean_items[gift.id] = 0;
        });

        if(Object.keys(clean_items).length) {
            updateCartItems(clean_items, (data) => {
                updateCart(data);
            });
        }
    */

}

function validateGifts () {



    let clean_items = {};
    const gifts_in_cart = cartItems.filter( item => item.properties?._gift == 'true' && item.properties?._related != null);
    if (gifts_in_cart.length) {

        gifts_in_cart.forEach( gift => {
            //const relatedInCart = cartItems.filter( item => item.product_id == gift.properties?._related);
            const relatedInCart = cartItems.filter( item => gift.properties?._related.includes(item.product_id));
            if (!relatedInCart.length) {
                clean_items[gift.id] = 0;
            }
        });
    }

    if(Object.keys(clean_items).length) {
        updateCartItems(clean_items, (data) => {
            document.querySelectorAll(`.free-gift__selector`).forEach(selector => selector.classList.remove('free-gift__selector--applied'));
            document.querySelector(`.cart__gamification-gifts`).classList.remove('cart__gamification-gifts--reached');
            updateCart(data);
        });
    }
}

function setGiftFunctions () {
    document.querySelectorAll('.free-gift__selector .product-unit').forEach(product => product.classList.add('product-unit--quickadd'));
    document.querySelectorAll('.free-gift__selector .product-unit__colors').forEach(colors => {
        colors.classList.add('product-unit__colors--all', 'slide');
        colors.parentNode.parentNode.querySelector('.product-unit__colors--quickadd').append(colors)
    });
    document.querySelectorAll('.free-gift__selector .product-unit__swatches').forEach(swatches => {
        swatches.classList.add('slider');
        const sliderWrapper = swatches.parentNode;
        sliderWrapper.setAttribute('data-slide', 4);
        sliderWrapper.setAttribute('data-slide-mob', 3);
        sliderWrapper.innerHTML += `<button class="round-icon slider__control slider__control--prev round-icon--prev" title="Previous"></button><button class="round-icon slider__control slider__control--next round-icon--next" title="Next"></button>`;
        sliderWrapper.classList.add('slider__wrapper', 'slider__wrapper--start');
        checkSlider(sliderWrapper.querySelector('.slider'));
    });


    document.querySelectorAll('.free-gift__selector .product-unit__image.product-link').forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.free-gift__selector-product').forEach(selector => selector.classList.remove('free-gift__selector-product--active'))
            link.parentNode.parentNode.parentNode.classList.add('free-gift__selector-product--active')
        });
        if (index == 1) {
            document.querySelectorAll('.free-gift__selector-product').forEach(selector => selector.classList.remove('free-gift__selector-product--active'))
            link.parentNode.parentNode.parentNode.classList.add('free-gift__selector-product--active');
        }
    });

    // Select color and add to cart
    document.addEventListener('click', event => {
        if (event.target.matches(".free-gift__selector .color-swatch")) {
            //alert("select the color");

            const giftSelector = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            giftSelector.classList.add('free-gift__selector--applied');
            document.querySelector(`.cart__gamification-gifts`).classList.add('cart__gamification-gifts--reached');

            const gift = event.target.dataset.firstVariantId;
            let items = [{
                id: gift,
                quantity: 1,
                properties: {
                    '_gift': 'true',
                    '_related': giftSelector.dataset.keys
                }
            }];

            if (items.length > 0) {
                addToCart(items, 1, (data) => {
                    updateCart(data);
                });
            }
        }
    });
}

function setGamificationProducts( gifts, goalsVerbose, items_subtotal_price ) {

    const always = () => {};
    let items = [];
    const { goals, limit } = settings["cartGamification"];
    const gamificationIndicator = document.querySelector('.cart__gamification-indicator');

    setTimeout(function(){
        window.fetch('/cart.js', {
            credentials: 'same-origin',
            method: 'GET',
        })
        .then((response) => response.json())
        .then((cart) => {

            window.cartItems = cart.items;
            if (!cartShippingGift) {
                // Disable gift gamification by cart total
                if(gifts.length == 0) {

                    // Clean gifts from cart if exists
                    let clean_items = {};
                    const gifts_in_cart = cartItems.filter( item => item.properties?._gift == 'true');

                    gifts_in_cart.forEach( gift => {
                        clean_items[gift.id] = 0;
                    });

                    if(Object.keys(clean_items).length) {
                        updateCartItems(clean_items, (data) => {
                            updateCart(data);
                        });
                    }

                } else {

                    gifts.forEach(gift => {
                        if(!cartItems.find(item => item.properties?._gift == 'true')){
                            items.push({
                                id: gift,
                                quantity: 1,
                                properties: {
                                    '_gift': 'true'
                                }
                            });
                        }
                    });

                    if (items.length > 0) {
                        addToCart(items, 1, (data) => {
                            updateCart(data);
                            activateProductUnit(document.querySelector(".cart__item--gift .product-unit"));
                        });
                    }
                }
            } else {
                let verboseTemplate = '';
                let verboseTemplateGift = ''
                if ( goalsVerbose.filter(goal => goal.status == 'complete').length > 0) {
                    for(let x in goalsVerbose) {
                        let prefix = x == 0 ? `You are $${goalsVerbose[x].value} away from` : `Add $${goalsVerbose[x].value} to get`;
                        if (goalsVerbose[x].status == 'complete') {
                            verboseTemplate += `You got ${goalsVerbose[x].goal}! <br>`;
                            verboseTemplateGift += `Add any <a href="/collections/3-piece-luggage-sets">3-piece luggage set</a> to get a <strong>FREE</strong> gift (up to $98 value)!`;
                            document.querySelector('.cart__gam-verbose--gift').innerHTML = verboseTemplateGift;
                            document.querySelector('.free-gift__announcement').classList.add('free-gift__announcement--partial');
                        } else {
                            verboseTemplate += `${prefix} ${goalsVerbose[x].goal}! `;
                            document.querySelector('.free-gift__announcement').classList.remove('free-gift__announcement--partial');
                        }
                    }
                } else {
                    const toFixedPrice = goalsVerbose[0].value;
                    verboseTemplate =
                    `You are $${toFixedPrice.toFixed(2)} away from ${goalsVerbose[0].goal}!`.replace(
                        "FREE",
                        "<b>FREE</b>"
                    );
                    document.querySelector('.free-gift__announcement').classList.remove('free-gift__announcement--partial');
                }

                document.querySelector('.cart__gam-verbose').innerHTML = verboseTemplate;
                document.querySelector('.cart__gam-verbose--gift').innerHTML = verboseTemplateGift;



                let gamificationPercent = (items_subtotal_price * 100) / (limit * 100);
                if(gamificationPercent > 100) gamificationPercent = 100;
                gamificationIndicator.style.setProperty('--gamification-progress', `${gamificationPercent}%`);

                if (gamificationPercent == 100) {
                    const verboseGoals = goals[goals.length - 1].title;
                    document.querySelector(
                    ".cart__gam-verbose"
                    ).innerHTML = `You got ${verboseGoals}!`;

                }

                validateGifts(cartItems);
                // Free gifts
                setFreeGiftsByProduct(cartItems);
            }

        });
    }, 500)
}

function setGamificationProgress(items_subtotal_price, cart = {}) {



    /*
        !!!!!!!!!!!!!!!!!!
        CAUSES AN INFINITE LOOP WHEN GAMIFICATION IS DISABLED IN SETTINGS!!!
        !!!!!!!!!!!!!!!!!!
    */
    // if(document.querySelector('.cart__gamification-goals') != null && document.querySelector('.cart__gamification-goals').innerHTML == '') gamificationInit();

    const { goals, gifts, wrapper, limit } = settings["cartGamification"];
    const cartHeader = document.querySelector('.cart__header');
    const cartGoals = document.querySelector(wrapper);
    const cartGifts = document.querySelector('.cart__gamification-gifts');
    const gamificationIndicator = document.querySelector('.cart__gamification-indicator');
    let freeShippingStarts = -1;
    if(goals.length) freeShippingStarts = goals.find(goal => goal.title == 'free standard shipping').value * 100;


    cartGoals.innerHTML = '';
    let goalsVerbose = [];
    let goalsGifts = [];

    goals.forEach((item, index) => {
        // Set gamification progressbar
        const goalOffset = item.value / limit * 100;
        const goalTemplate = `
            <div class="cart__gamification-goal" style="left: ${goalOffset}%">
                <figure class="cart__gamification-icon ${items_subtotal_price >= (item.value * 100) ? 'cart__gamification-icon--reached' : false}">
                    ${item.icon}
                </figure>
            </div>
        `;
        cartGoals.innerHTML += goalTemplate;

        if (items_subtotal_price < (item.value * 100)) {

            let left_value = item.value - (items_subtotal_price / 100);
            goalsVerbose.push({
                'goal': item.title,
                'status': 'incomplete',
                'value': left_value
            })
        } else {
            goalsVerbose.push({
                'goal': item.title,
                'status': 'complete',
                'value': 0
            });
            if(item.product != '') goalsGifts.push(item.product);
        }
    });

    cartGifts.innerHTML = '';
    gifts.forEach((item, index) => {
        const giftTemplate = `
            <div class="cart__gamification-goal cart__gamification-goal--gift" style="left: 100%">
                <figure class="cart__gamification-icon">
                    ${item.icon}
                </figure>
            </div>
        `;
        cartGifts.innerHTML += giftTemplate;
    });

    setGamificationProducts(goalsGifts, goalsVerbose, items_subtotal_price);

    const verboseMessage = document.querySelector('.cart__gam-verbose').innerHTML;

    if(verboseMessage.indexOf('You got FREE shipping and a FREE gift') === -1) {


    }

    if(freeShippingStarts > -1 && items_subtotal_price >= freeShippingStarts) {
        cartHeader.setAttribute('data-status', 'success');
        return true;
    } else {
        cartHeader.setAttribute('data-status', 'progress');
        return false;
    }
}

// function setGamificationProgress(items_subtotal_price, cart = {}) {

//     if(document.querySelector('.cart__gamification-goals') != null && document.querySelector('.cart__gamification-goals').innerHTML == '') gamificationInit();

//     const { goals, wrapper, limit } = settings["cartGamification"];
//     const cartHeader = document.querySelector('.cart__header');
//     const cartGoals = document.querySelector(wrapper);
//     const gamificationIndicator = document.querySelector('.cart__gamification-indicator');
//     const freeShippingStarts = goals.find(goal => goal.title == 'free standard shipping').value * 100;


//     cartGoals.innerHTML = '';
//     let goalsVerbose = [];
//     let goalsGifts = [];

//     goals.forEach((item, index) => {
//         // Set gamification progressbar
//         const goalOffset = item.value / limit * 100;
//         const goalTemplate = `
//             <div class="cart__gamification-goal" style="left: ${goalOffset}%">
//                 <figure class="cart__gamification-icon ${items_subtotal_price >= (item.value * 100) ? 'cart__gamification-icon--reached' : false}">
//                     ${item.icon}
//                 </figure>
//             </div>
//         `;
//         cartGoals.innerHTML += goalTemplate;

//         if (items_subtotal_price < (item.value * 100)) {

//             let left_value = item.value - (items_subtotal_price / 100);
//             goalsVerbose.push({
//                 'goal': item.title,
//                 'status': 'incomplete',
//                 'value': left_value
//             })
//         } else {
//             goalsVerbose.push({
//                 'goal': item.title,
//                 'status': 'complete',
//                 'value': 0
//             });
//             if(item.product != '') goalsGifts.push(item.product);
//         }
//     });

//     setGamificationProducts(goalsGifts);

//     let verboseTemplate = '';
//     if ( goalsVerbose.filter(goal => goal.status == 'complete').length > 0) {
//         for(let x in goalsVerbose) {
//             let prefix = x == 0 ? `You are $${goalsVerbose[x].value.toFixed(2)} away from` : `Add $${goalsVerbose[x].value.toFixed(2)} to get`;
//             if (goalsVerbose[x].status == 'complete') {
//                 verboseTemplate += `You got ${goalsVerbose[x].goal}! <br>`;

//             } else {
//                 verboseTemplate += `<b>${prefix} ${goalsVerbose[x].goal}!</b> `;
//             }
//         }
//     } else {
//         verboseTemplate = `You are $${goalsVerbose[0].value.toFixed(2)} away from <b>${goalsVerbose[0].goal}</b>!`;
//     }

//     document.querySelector('.cart__gam-verbose').innerHTML = verboseTemplate;

//     let gamificationPercent = (items_subtotal_price * 100) / (limit * 100);
//     if(gamificationPercent > 100) gamificationPercent = 100;
//     gamificationIndicator.style.setProperty('--gamification-progress', `${gamificationPercent}%`);

//     if (gamificationPercent == 100) {

//         const verboseGoals = goals[goals.length - 1].title;
//         document.querySelector('.cart__gam-verbose').innerHTML = `Congrats! <br> <b>You got ${ verboseGoals }!</b>`;

//     }

//     if(items_subtotal_price >= freeShippingStarts) {
//         cartHeader.setAttribute('data-status', 'success');
//         return true;
//     } else {
//         cartHeader.setAttribute('data-status', 'progress');
//         return false;
//     }
// }

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


    //document.querySelector('.cart__items-container').innerHTML = data.sections['cart-items'];
    document.querySelector('.cart__items-container').innerHTML = data.sections['cart-items'];
    if(document.body.classList.contains('variant')){
        //console.log("🚀 ~ file: cart.js:366 ~ updateCart ~ data.sections['cart-pair-upsell']:", data.sections['cart-pair-upsell'])
        updateUpsell(data.sections['cart-pair-upsell']);
    }

    let cart;
    if(jsonIncluded) cart = data;
    else cart = JSON.parse(stripHTML(data.sections['cart-json']));

    const cartContainer = document.querySelector('.cart__container, .cart-page');

    if(cart.item_count == 0) cartContainer.classList.add('cart__container--empty');
    else cartContainer.classList.remove('cart__container--empty');

    setHeaderItemCounter(cart);
    let freeShipping;
    let checkShipping = document.querySelector('.cart__free-shipping')
    checkShipping ? freeShipping = setFreeShippingProgress(cart) : setGamificationProgress(cart.items_subtotal_price, cart);


    let totalPrice = cart.total_price;
    if(!freeShipping) totalPrice += 795;

    cartContainer.querySelector('.cart__count').innerHTML = cart.item_count;
    cartContainer.querySelector('.cart__total-row--subtotal .cart__total-value').innerHTML = formatPrice(cart.items_subtotal_price / 100);
    cartContainer.querySelector('.cart__payments-amnt').innerHTML = formatPrice(totalPrice / 4 / 100);

    if(totalPrice * 1 <= 5000) cartContainer.querySelector('.cart__4-payments').classList.add('cart__4-payments--limit');
    else cartContainer.querySelector('.cart__4-payments').classList.remove('cart__4-payments--limit');

    cartContainer.querySelector('.cart__total-row--total .cart__total-value').innerHTML = formatPrice(totalPrice / 100);


   if (cartShippingGift) {
     // Reorder cart items

     const cartItems = data.items;
     const reorderedCartItems = [];
     cartItems.filter(function(item){
         if(item.handle.includes('3-piece-luggage-set')){
             document.querySelector(`.cart__gamification-gifts`).classList.add('cart__gamification-gifts--half');
         } else {
             document.querySelector(`.cart__gamification-gifts`).classList.remove('cart__gamification-gifts--half');
         }
     });

     cartItems.forEach(function(item) {

         if (item.properties?._gift == 'true') {
         reorderedCartItems.unshift(item);
         } else {
         reorderedCartItems.push(item);
         }
     });

     data.items = reorderedCartItems;
     document.querySelector('.cart__items-container').innerHTML = data.sections['cart-items'];
   }
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

    if(settings["cartGamification"] && settings["cartGamification"].gifts.length > 0 && document.querySelector('.cart__gamification-goals') != null && document.querySelector('.cart__gamification-goals').innerHTML == '') gamificationInit();

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

            updateCart(data, true);
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

            updateCart(data, true);
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

/* eslint-disable no-undef */
function support() {
	if (!window.DOMParser) return false;

	const parser = new DOMParser();

  try {
		parser.parseFromString('x', 'text/html');
	} catch (err) {
		return false;
	}

	return true;
};

/**
 * Convert a template string into HTML DOM nodes
 * @param  {String} str The template string
 * @return {Node}       The template HTML
 */
function stringToHTML(str) {
	// If DOMParser is supported, use it
	if (support()) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(str, 'text/html');
		return doc.body;
	}

	// Otherwise, fallback to old-school method
	const dom = document.createElement('div');
	dom.innerHTML = str;
	return dom;
}

function updateUpsell(str){
    const upsellContainer = document.querySelector('.cart__upsell-items--ab-test-variant');
    upsellContainer.innerHTML = stringToHTML(str).innerHTML;
    const products = upsellContainer.querySelectorAll(".product-unit")
    products.forEach(product => {
        activateProductUnit(product);
    })

    let visibleUpsells = [];
    document.querySelectorAll('.cart__items .cart__item').forEach(item => visibleUpsells.push(item.dataset.id));
    document.querySelectorAll('.cart__upsell-items--ab-test-variant .product-unit').forEach(item => {
        visibleUpsells.includes(item.dataset.id) ? item.style.display = 'none' : '';
        visibleUpsells.push(item.dataset.id);
    });

}
