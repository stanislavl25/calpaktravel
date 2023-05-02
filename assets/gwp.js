"use strict";

if(window.debug) console.log("gwp.js loaded");

function getEligiblePriceAndNumber(cart, gwpProduct, gwp_ids) {
    let totalEligiblePrice = 0; // Total price of eligible items
    let eligibleCount = 0; // Number of matching items
    
    if(isset(cart.items) && isset(gwpProduct.ids)) cart.items.forEach(item => {
        if(
            (gwpProduct.ids == 'all' || gwpProduct.ids.indexOf(item.product_id) > -1) &&
            item.handle != 'gift-card' &&
            item.price > 0 &&
            (!isset(item.properties) || !isset(item.properties['_gwp'])) &&
            gwp_ids.indexOf(item.product_id) === -1
        ) {
            totalEligiblePrice += item.line_price;
            eligibleCount += item.quantity;
        }
    });

    return [totalEligiblePrice, eligibleCount];
}

function getGWPCollectionProducts(collection, index) {
    return fetch(`/collections/${collection}/products.json?limit=250`).then(response => response.json()).then(data => {
        gwpConfig.products[index].ids = data.products.map(product => product.id);
    });
}

function fillGWPConfig() {
    return new Promise(resolve => {
        let promises = [];
        for(let i = 0; i < gwpConfig.products.length; i++) {
            const product = gwpConfig.products[i];

            if((!isset(product.ids) || product.ids.length == 0) && product.collection) {
                promises.push(getGWPCollectionProducts(product.collection, i));
            }
        }

        if(promises.length == 0) {
            resolve(gwpConfig);
        } else Promise.all(promises).then(() => {
            resolve(gwpConfig);
        });
    });
}

function isGWPItem(item) {
    return isset(item.properties) && isset(item.properties['_gwp']) && item.properties['_gwp'] == true;
}

async function checkGWP(data) {
    const cart = JSON.parse(stripHTML(data.sections['cart-json']));

    gwpConfig = await fillGWPConfig();

    return new Promise(async resolve => {
        let allGwpIds = [],
            activeGwpIds = [],
            activeGWPs = [];

        gwpConfig.products.forEach(product => {
            if(typeof product.pid != 'undefined') allGwpIds.push(product.pid)
        });

        for(let i = 0; i < gwpConfig.products.length; i++) {
            let gwpProduct = gwpConfig.products[i];
            
            // Calculating total price and number of eligible items
            let [totalEligiblePrice, eligibleCount] = getEligiblePriceAndNumber(cart, gwpProduct, allGwpIds);
            
            if(totalEligiblePrice == 0) continue; // If no eligible items found
            if(isset(gwpProduct.threshold) && totalEligiblePrice < parseInt(gwpProduct.threshold)) continue; // If price is below the threshold

            activeGwpIds.push(gwpProduct.pid);
            activeGWPs.push({
                product: gwpProduct,
                number: gwpProduct.type == 2?eligibleCount:1
            });
            if(gwpConfig.type == 1) break;
        }

        let gwpItemsUpdate = [],
            gwpItemsAdd = [];
        // remove free non-gwps
        cart.items.forEach(item => {
            if(
                (item.price == 0 || isGWPItem(item) || allGwpIds.indexOf(item.product_id) > -1) && // If item is free or is part of all GWPs
                (activeGWPs.length == 0 || activeGwpIds.indexOf(item.product_id) == -1)) { // and if it's not a part of active GWPs
                gwpItemsUpdate.push([item.key, 0]); // remove it from cart
            }
        });

        let gwp_message = '',
        gwps_names = [];
        
        // search for gwps already in cart
        activeGWPs.forEach(activeGWP => {
            gwps_names.push(activeGWP.product.title);

            let GWPinCart = 0,
                GWPinCartKey = false;

            cart.items.forEach(item => {
                if(item.product_id == activeGWP.product.pid) {
                    GWPinCart += item.quantity;
                    GWPinCartKey = item.key;
                }
            });

            if(activeGWP.number != GWPinCart) {
                if(GWPinCart > 0) gwpItemsUpdate.push([GWPinCartKey, activeGWP.number]);
                else gwpItemsAdd.push({
                    id: activeGWP.product.id,
                    quantity: activeGWP.number,
                    properties: {
                        _gwp: true
                    }
                });
            }
        });

        if(gwpItemsAdd.length > 0) {
            data = await fetch(`${routes.cart_add_url}.js`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    cb: Date.now(),
                    items: gwpItemsAdd,
                    sections: 'cart-items,cart-json'
                })
            }).then(response => response.json());
        }

        if(gwpItemsUpdate.length > 0) {
            // let promises = [];
            for(let it = 0; it < gwpItemsUpdate.length; it++) {
                data = await changeCartItem(gwpItemsUpdate[it][0], gwpItemsUpdate[it][1]);
            }
            // gwpItemsUpdate.forEach(gwpItemsUpd => {
                // promises.push(
                        // changeCartItem(gwpItemsUpd[0], gwpItemsUpd[1])
                    // );
            // });

            // data = await Promise.all(promises).then(values => values.pop());
        }

        resolve(data);

        // if(typeof gwpConfig != 'undefined') gwp_message = 'GWP - ' + gwps_names.join(' + ');
    })
}