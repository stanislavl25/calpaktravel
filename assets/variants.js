"use strict";

function productUnitUpdateHover(option, productImageContainer, sizes) {
    let hoverImg = productImageContainer.querySelector('.img-hover');
    if(option.hasAttribute('data-hover')) {
        const hover = option.getAttribute('data-hover');

        if(hover) {
            if(hoverImg) hoverImg.setAttribute('srcset', lazyloadImageSrcset(hover));
            else {
                hoverImg = document.createElement('img');
                hoverImg.setAttribute('src', hover);
                hoverImg.setAttribute('sizes', sizes);
                hoverImg.setAttribute('srcset', lazyloadImageSrcset(hover));
                hoverImg.classList.add('img-hover');
                hoverImg.setAttribute('loading', 'eager');
                productImageContainer.appendChild(hoverImg);
            }
        } else if(hoverImg) hoverImg.remove();
    } else if(hoverImg) hoverImg.remove();
}

function updateProductURLs(productContainer, options, multiple = false, earlyAccess = false) {
    const handle = productContainer.getAttribute('data-handle');
    const productLinks = productContainer.querySelectorAll('.product-link, .quick-view__link');
    productLinks.forEach(productLink => {
        if(multiple) productLink.setAttribute('href', `/products/${handle}/${earlyAccess?'early-access-':''}${options.join(',')}`);
        else productLink.setAttribute('href', `/products/${handle}/${earlyAccess?'early-access-':''}${options[0]}`);
    });
}

function handlePreorderLabels(productContainer, option, location) {
    let preorderLabels = productContainer.querySelectorAll('.product-label--preorder');
    preorderLabels.forEach(preorderLabel => preorderLabel.classList.remove('product-label--active'));

    if(option.getAttribute('data-available') != 'false') {
        let preorder = false;
        if(option.hasAttribute('data-preorder')) preorder = option.getAttribute('data-preorder');

        if(preorder) {
            if(location == 'pdp') productContainer.closest('.pdp__grid, .qv__body').setAttribute('data-status', 'preorder');

            preorderLabels.forEach(preorderLabel => {
                preorderLabel.classList.add('product-label--active');
                preorderLabel.querySelector('.preorder-date').innerHTML = preorder;
            });
        } else if(location == 'pdp') productContainer.closest('.pdp__grid, .qv__body').setAttribute('data-status', 'default');
    }
}

function variantUpdateProcess(target) {
    if(window.location.pathname.includes('product')) {
        changeBadgeAbsolutePosition(); // defined on pdp.js
    }
    const productContainer = target.closest('.product-unit, .shopify-product-form');
    
    
    if(!productContainer) return;
    
    const select = productContainer.querySelector('.variant-select');
    if(!select) return;
    
    const hasSizeSelector = productContainer.querySelector('.product-unit__sizes') ? true: false;
    let location = false;
    if(productContainer.classList.contains('product-unit')) location = 'unit';
    else if(productContainer.classList.contains('shopify-product-form')) location = 'pdp';
    
    let [options, multiple] = getProductOptionsList(productContainer, location);
    

    let option = false,
        selector = `option`;
    if(location == 'unit' && options.length > 1) {
        if (hasSizeSelector) {
            const optionSize = productContainer.querySelector('.product-unit__sizes .size-swatch.selected').dataset.title;
            selector += `[data-option1="${options[0]}"][data-option2="${optionSize}"]`;
        } else {
            selector += `[data-option1="${options[0]}"]`;
        }
        option = select.querySelector(selector + '[data-available="true"]');
        if(!option) {
            option = select.querySelector(selector)
        } else {
            options[1] = option.getAttribute('data-option2');
        }
    } else {
        for(let i = 0; i < options.length; i++) selector += `[data-option${i + 1}="${options[i]}"]`;
        option = select.querySelector(selector);
    }

    if(!option) return;
    select.value = option.value;


    const earlyAccessValue = productContainer.getAttribute('data-early-access');
    updateProductURLs(productContainer, options, multiple, earlyAccessValue == 'all' || earlyAccessValue == 'only');
    
    const wishlistButtons = productContainer.querySelectorAll('.wishlist__button');
    if(wishlistButtons.length > 0 && wishlist) wishlistButtons.forEach(wishlistButton => checkWishlistButton(wishlistButton, option.value));

    if(location == 'pdp') updateOptionsAvailability(options, select, productContainer);

    let price = option.getAttribute('data-price');
    let cprice = false;
    if(option.hasAttribute('data-cprice')) cprice = option.getAttribute('data-cprice');
    let formatedPrice = `<b>${formatPrice(price / 100)}</b>`;
    if(cprice) formatedPrice = `<s>${formatPrice(cprice / 100)}</s>` + formatedPrice;
    
    const optionalLabels = productContainer.closest('.product-unit, .pdp__grid, .qv__body').querySelectorAll('.product-label[data-options]');
    optionalLabels.forEach(optionalLabel => {
        if(optionalLabel.matches(`[data-options~="${options[0]}"]`) || optionalLabel.matches(`[data-options~="${option.value}"]`)) { 
            optionalLabel.classList.add('product-label--active');
            
            if (optionalLabel.classList.contains('product-label--badge')) {
                optionalLabel.classList.add('badge-active');
            }
            
            if(optionalLabel.classList.contains('product-label--extra-sale')) {
                productContainer.closest('.product-unit, .pdp__info, .qv__body').classList.add('extra-sale-active');
            }
        } else {
            optionalLabel.classList.remove('product-label--active');
            if (optionalLabel.classList.contains('product-label--badge')) {
                optionalLabel.classList.remove('badge-active');
            }
            
            if(optionalLabel.classList.contains('product-label--extra-sale')) {
                productContainer.closest('.product-unit, .pdp__info, .qv__body').classList.remove('extra-sale-active');
            }
        }
    });

    handlePreorderLabels(productContainer, option, location);

    if(location == 'unit') {
        const img = option.getAttribute('data-image');
        
        if(option.getAttribute('data-available') == 'false') {
            productContainer.classList.add('product-unit--na')
            if(
                option.getAttribute(`data-soldout-all-variants`) === true ||
                option.getAttribute(`data-soldout-this-variant`) === true 
            ) {
                productContainer.classList.add('product-unit--so')
            } else {
                productContainer.classList.add('product-unit--jw')
            }
        } else {
            productContainer.classList.remove('product-unit--na');
            productContainer.classList.remove('product-unit--so')
            productContainer.classList.remove('product-unit--jw')
        }
        
        try {
        productContainer.querySelector('.product-unit__price').innerHTML = formatedPrice;
        } catch {}
        
        const pdpDscnts = productContainer.querySelectorAll('.dscnt');
        if(cprice) {
            let discount = Math.floor((cprice - price) * 100 / cprice);
            pdpDscnts.forEach(pdpDscnt => {
                pdpDscnt.parentNode.classList.remove('product-label--hidden');
                pdpDscnt.innerHTML = `${discount}%`;
            });
        } else pdpDscnts.forEach(pdpDscnt => pdpDscnt.parentNode.classList.add('product-label--hidden'));
        
        if(productContainer.classList.contains('adding-to-cart')) productContainer.classList.remove('adding-to-cart');
        if(productContainer.classList.contains('added-to-cart')) productContainer.classList.remove('added-to-cart');

        const productImageContainer = productContainer.querySelector('.product-unit__image');
        
        let sizes = '50vw';
        if(img) {
            productImageContainer.querySelector('img').setAttribute('srcset', lazyloadImageSrcset(img));
            sizes = productImageContainer.querySelector('img').getAttribute('sizes');
        }

        productUnitUpdateHover(option, productImageContainer, sizes);

    } else if(location == 'pdp') {
        const pdpInfo = productContainer.closest('.pdp__info, .qv__product');
        const pdpGrid = productContainer.closest('.pdp__grid, .qv__body');
        const isQuickView = pdpGrid.classList.contains('qv__body');

        const ytPoints = pdpGrid.querySelectorAll('.yt-points');
        ytPoints.forEach(ytPoint => ytPoint.innerHTML = Math.floor(price / 100));

        if(option.getAttribute('data-available') == 'false') {
            pdpGrid.setAttribute('data-status', 'sold-out');

            const waitlist = pdpGrid.querySelector('.pdp__waitlist--success');
            if(waitlist) waitlist.classList.remove('pdp__waitlist--success');

            if(pdpGrid.hasAttribute('data-soldout')) {
                if(pdpGrid.matches(`[data-soldout~=${options[0]}]`)) pdpGrid.classList.add('pdp__grid--soldout');
                else pdpGrid.classList.remove('pdp__grid--soldout');
            }
        }

        const qty = option.getAttribute('data-qty');
        const stock = pdpInfo.querySelector('.pdp__stock');
        if(qty > 0 && qty <= 10) {
            stock.querySelector('span').innerHTML = qty;
            stock.classList.add('pdp__stock--active');
        } else stock.classList.remove('pdp__stock--active');

        if(price * 1 <= 5000) pdpInfo.querySelector('.pdp__payments').classList.add('pdp__payments--limit');
        else pdpInfo.querySelector('.pdp__payments').classList.remove('pdp__payments--limit');
        pdpInfo.querySelector('.pdp__payments-amnt').innerHTML = formatPrice(price / 4 / 100);

        const pdpPrices = pdpInfo.querySelectorAll('.pdp__price-inner, .pdp__submit-price');
        pdpPrices.forEach(pdpPrice => pdpPrice.innerHTML = formatedPrice);
  

        const pdpDscnts = pdpGrid.querySelectorAll('.dscnt');
        if(cprice) {
            let discount = Math.floor((cprice - price) * 100 / cprice);
            pdpDscnts.forEach(pdpDscnt => {
                pdpDscnt.parentNode.classList.remove('product-label--hidden');
                pdpDscnt.innerHTML = `${discount}%`
            });
        } else pdpDscnts.forEach(pdpDscnt => {
            pdpDscnt.parentNode.classList.add('product-label--hidden');
        });

        pdpGalleryUpdate(pdpGrid, option, isQuickView);
        pdpSizePriceUpdate(option);
        
        if(!isQuickView) {
            pdpHandleUpsell(option);
            pdpHandleDescriptions(pdpInfo, option);
            pdpHandleFeaturedCollection(option);
            pdpUpdateURL(product, options);
        }
    }
}

async function selectThisColorSwatch(colorSwatch) {
    if(typeof variantUpdateProcess == 'undefined') {
        await loadScript(scripts.variants);
    }

    const actives = colorSwatch.closest('.swatches-container').querySelectorAll('.color-swatch--active');
    actives.forEach( active => active.classList.remove('color-swatch--active') );
    colorSwatch.classList.add('color-swatch--active');

    variantUpdateProcess(colorSwatch);
}