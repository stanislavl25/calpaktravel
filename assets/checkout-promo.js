"use strict";
/*
    This script overrides default AJAX requests and adds GWPs that come with coupons.
    Applying the coupon:
        1. If some other coupon is already applied, the script checks if the previous
            coupon code had GWPs added, and it yes -- it removes it
        2. The GWP is added
        3. The page is reloaded with a ?discount parameter to apply the coupon
        4. If on page load the GWP is there, but the coupon hasn't been applied for
            some reason, the item is removed
        5. If on page load the coupon is there, but the item is missing, the item is
            added again
        
    Removing the coupon:
        1. The coupon is removed
        2. The GWP is removed
*/

// Check if a discount is currently applied. If yes, store the value.
let current_dicount = document.querySelector('.tags-list .reduction-code__text');
if(current_dicount) current_dicount = current_dicount.innerHTML;//.split('(')[0].trim();
else current_dicount = false;


let vid = false; // GWP Variant ID being applied
let discount = false; // Discount code being applied through the URL

// Apply the discount through the URL
if(location.href.indexOf('discount=') > -1) {
    let atts = location.href.split('?');
    let url = atts[0];
    document.body.classList.add('enable-notice');

    // Setting up variables and the rewritten URL
    if(atts.length > 1) {
        let spl = atts[1].split('&');
        for(let i = 0; i < spl.length; i++) {
            let d = spl[i].split('=');
            if(d[0] == 'vid') vid = d[1];
            if(d[0] == 'discount') discount = d[1];
            if(d[0] != 'discount' && d[0] != 'vid') {
                if(url.indexOf('?') > -1) url += '&';
                else url += '?';
                url += d[0];
                if(typeof d[1] != 'undefined') url += '=' + d[1];
            }
        }
    }
    // Update the URL to remove the discount info
    window.history.replaceState({}, '', url);

    let added = document.querySelector('.product[data-variant-id="'+ vid +'"]');
    if(added) {
        // If the item has been added, but the discount failed for some reason -- remove the item
        if(current_dicount == false || (current_dicount.toLowerCase() != discount.toLowerCase())) {
            added.style.display = 'none';
            let obj = {};
            obj[vid] = 0;
            fetch('/cart/update.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({updates: obj})
            }).then(response => response.json()).then(data => location.href = '/checkout');
        } else {
            // If everything was a success -- add custom properties to the newly added item
            // let obj = {
            //     'line': 1,
            //     'properties': { '_c_promo': added.querySelector('.product__price .order-summary__emphasis').innerHTML.replace('Free', 'GWP') }
            // };

            // fetch('/cart/change.js', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify(obj)
            // }).then(response => response.json()).then(() => {});
        }
    }
} else if(current_dicount) {
    // If there's a discount applied
    let c_dicount = btoa(current_dicount.toLowerCase());
    for(let i = 0; i < promos.length; i++) {
        if(promos[i][0] == c_dicount) {
            // If there's a discount applied and we have a matching promo set up
            fetch('/products/' + promos[i][1] + '/product.json')
            .then(response => response.json())
            .then(data => {
                if(typeof data.product == 'undefined') return;
                let id = data.product.variants[0].id;
            
                // If the item is in the cart already -- do nothing
                if(document.querySelector('.product[data-variant-id="' + id + '"]')) return;

                // Otherwise add it to the cart
                addToCart(id, 1, () => {
                    location.href = '/checkout';
                    // OrderSummaryUpdater.prototype.onChange(document);
                    // console.log(send.apply(save_this, save_arguments));
                });
            });

            break;
        }
    }
}

let promo_input = document.querySelector('#checkout_reduction_code');

let remove_item = false; // Item that needs to be removed
let remove_id = false; // Item variant ID to remove it from HTML

let send = window.XMLHttpRequest.prototype.send; // The real "send" function backup
let onReadyStateChange = false;
let priceLimit = 0;
let promo_form = false;
if(promo_input) promo_form = promo_input.closest('.edit_checkout');
if(promo_input && promo_form) {
    // Override the async send function to catch all AJAX requests
    window.XMLHttpRequest.prototype.send = async function(data) {
        let found = false;
        let save_this = this; // Saving "this" context to resume normal operations of "send"
        let save_arguments = arguments; // Saving "arguments" to resume normal operations of "send"
        let price = document.querySelector('[data-checkout-payment-due-target]').getAttribute('data-checkout-payment-due-target') * 1;
        if(data != null && typeof data != 'undefined') {

            if(data.indexOf('reduction_code') > -1) {
                setTimeout(function() {
                    document.body.classList.add('enable-notice');
                }, 2000);
            }

            // If this request aims to add a promo code
            if(data.indexOf('reduction_code') > -1 && data.indexOf('method=patch') > -1) {
                
                let c_dicount = document.querySelector('.tags-list .reduction-code__text'); // Discount code that is being applied

                // If there's already a discount applied and a new one is going to replace it in this request
                if(c_dicount) {

                    c_dicount = btoa(c_dicount.innerHTML.toLowerCase()); // base64 encode the discount code, because that's how it's stored in the promos array (checkout-promos.liquid)

                    for(let i = 0; i < promos.length; i++) {

                        // If found a matching promo code for the OLD discount
                        if(promos[i][0] == c_dicount) {

                            let productList = [];
                            let productCheck = true;
                            priceLimit = promos[i][2] * 100;
                            if(promos[i][3]) {
                                productCheck = false;
                                
                                let collection = await fetch(`https://www.calpaktravel.com/collections/${promos[i][3]}/products.json?limit=250`).then(response => response.json());
                                collection.products.forEach(product => productList.push(product.id));
            
                                if(cart_cache) for(let ii = 0; ii < cart_cache.length; ii++) {
                                    if(productList.indexOf(cart_cache[ii].product_id) > -1) {
                                        productCheck = true;
                                        break;
                                    }
                                }
                            }

                            if(price >= priceLimit && productCheck) {
                                // Get product info, because we need an id, but we only have the handle, and it's impossible to convert handle to id in the checkout template using liquid
                                fetch('/products/' + promos[i][1] + '/product.json')
                                .then(response => response.json())
                                .then(data => {
                                    if(typeof data.product == 'undefined') return;
                                    let vid = data.product.variants[0].id; // Variant ID of the product that needs to be added


                                    // Remove the GWP from the old discount
                                    let obj = {};
                                    obj[vid] = 0;
                                    fetch('/cart/update.js', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({updates: obj})
                                    }).then(response => response.json()).then(data => {
                                        let val = btoa(document.querySelector('#checkout_reduction_code').value.toLowerCase());
                                        for(let i = 0; i < promos.length; i++) {

                                            // Promo match found
                                            if(promos[i][0] == val) {
                                                found = true;
                                                fetch('/products/' + promos[i][1] + '/product.json')
                                                    .then(response => response.json())
                                                    .then(data => {
                                                        if(typeof data.product == 'undefined') return;
                                                        let id = data.product.variants[0].id;

                                                        // If the promo item is already in the cart continue with normal request and exit
                                                        if(document.querySelector('.product[data-variant-id="' + id + '"]')) {
                                                            remove_item = id;
                                                            return send.apply(save_this, save_arguments);
                                                        }

                                                        // Otherwise add the GWP and redirect to a URL that will add the promo code
                                                        addToCart(id, 1, () => {
                                                            let new_href = location.href;
                                                            if(location.href.indexOf('?') > -1) new_href += '&';
                                                            else new_href += '?';
                                                            new_href = '/checkout?';
                                                            new_href += 'discount=' + document.querySelector('#checkout_reduction_code').value + '&vid=' + id;
                                                            location.href = new_href;
                                                        });
                                                    });

                                                break;
                                            }
                                        }
                                    });
                                });

                                // Don't run other code if a match is found here
                                return;
                            }
                        }
                    }
                }

                // If there's no other promo code applied at the moment -- add the GWP and the promo code
                let val = btoa(document.querySelector('#checkout_reduction_code').value.toLowerCase());
                for(let i = 0; i < promos.length; i++) {
                    if(promos[i][0] == val) {

                        let productList = [];
                        let productCheck = true;
                        priceLimit = promos[i][2] * 100;
                        if(promos[i][3]) {
                            productCheck = false;
                            
                            let collection = await fetch(`https://www.calpaktravel.com/collections/${promos[i][3]}/products.json?limit=250`).then(response => response.json());
                            collection.products.forEach(product => productList.push(product.id));
        
                            if(cart_cache) for(let ii = 0; ii < cart_cache.length; ii++) {
                                if(productList.indexOf(cart_cache[ii].product_id) > -1) {
                                    productCheck = true;
                                    break;
                                }
                            }
                        }

                        if(price >= priceLimit && productCheck) {
                            found = true;
                            fetch('/products/' + promos[i][1] + '/product.json')
                                .then(response => response.json())
                                .then(data => {
                                    if(typeof data.product == 'undefined') return;
                                    let id = data.product.variants[0].id;

                                    // If the promo item is already in the cart continue with normal request and exit
                                    if(document.querySelector('.product[data-variant-id="' + id + '"]')) {
                                        remove_item = id;
                                        return send.apply(save_this, save_arguments);
                                    }

                                    // Otherwise add the GWP and redirect to a URL that will add the promo code
                                    addToCart(id, 1, () => {
                                        if(env === 'live') {
                                            OrderSummaryUpdater.prototype.onChange(document);
                                            send.apply(save_this, save_arguments);
                                        } else {
                                            let new_href = location.href;
                                            if(location.href.indexOf('?') > -1) new_href += '&';
                                            else new_href += '?';
                                            new_href = '/checkout?';
                                            new_href += 'discount=' + document.querySelector('#checkout_reduction_code').value + '&vid=' + id;
                                            location.href = new_href;
                                        }
                                    });
                                });
                            break;
                        }
                    }
                }
            }
            // If about to remove the promo code -- save the item that will have to be removed when the request is done
            else if(current_dicount && data.indexOf('clear_discount') > -1 && data.indexOf('method=patch') > -1) {
                let val = btoa(current_dicount.toLowerCase());
                for(let i = 0; i < promos.length; i++) {
                    if(promos[i][0] == val) {
                        found = true;
                        fetch('/cart.json').then(response => response.json()).then(data => {
                            for(let j = 0; j < data.items.length; j++) {
                                let item = data.items[j];
                                if(item.handle == promos[i][1]) {
                                    remove_item = item.key;
                                    remove_id = item.variant_id;

                                    // Continue the request to delete the coupon
                                    send.apply(save_this, save_arguments);
                                    break;
                                }
                            }
                        });
                        break;
                    }
                }
            }
        }

        // If nothing matched -- continue normal operations of the "send" function
        if(!found) {
            if(this.onreadystatechange) this._onreadystatechange = this.onreadystatechange;
            this.onreadystatechange = function() {
                if(this._onreadystatechange) return this._onreadystatechange.apply(this, arguments);
            };

            return send.apply(this, arguments);
        }
    };
}

// Catch jQuery AJAX complete Event
Checkout.$(document).ajaxComplete(function( event, xhr, settings ) {
    // If this event was responsible for removing the promo code -- remove the GWP from cart
    if(remove_item && typeof settings.data != 'undefined' && settings.data.indexOf('clear_discount') > -1 && settings.data.indexOf('method=patch') > -1) {
        let obj = {};
        obj[remove_item] = 0;

        fetch('/cart/update.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({updates: obj})
        }).then(response => response.json()).then(data => {
            location.href = '/checkout';
        });
    }

    // Text updates to the GWP items, after jQuery reloads the product list
    let prices = document.querySelectorAll('.product__price .order-summary__emphasis');
    if(prices.length) for(let i = 0; i < prices.length; i++) {
        if(prices[i].innerHTML == 'Free') {
            // prices[i].innerHTML = 'gift';
            prices[i].parentNode.querySelector('del').remove();
        }
    }
});

// Text updates to the GWP items 
let prices = document.querySelectorAll('.product__price .order-summary__emphasis');
if(prices.length) for(let i = 0; i < prices.length; i++) {
    if(prices[i].innerHTML == 'Free') {
        // prices[i].innerHTML = 'gift';
        prices[i].parentNode.querySelector('del').remove();
        let red = prices[i].closest('.product').querySelector('.reduction-code__text');
        let pr = red.innerHTML;
        pr = pr.split('(');
        red.innerHTML = pr[0] + '(' + pr[1].replace('-', '').replace(')', ' Value)');
    }
}

// If there are GWP items in the cart, but no discount applied -- remove the items
if(false && gwp_items.length > 0 && !current_dicount) {
    for(let i = 0; i < gwp_items.length; i++) {
        document.querySelectorAll('.product-table .product')[gwp_items[i] - 1].style.display = "none";
        let obj = {
            'line': gwp_items[i],
            'quantity': 0
        };
        
        fetch('/cart/change.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(obj)
        }).then(response => response.json()).then(data => location.href = '/checkout');
    }
}