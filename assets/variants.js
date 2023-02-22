"use strict";

function getProductUnitColorMatch(productUnit, color, colorGroup, onlyAvailable = true) {
    let match = false, backupMatch = false;

    const productUnitOptions = productUnit.querySelectorAll('.variant-select option');
    for(let i = 0; i < productUnitOptions.length; i++) {
        let singleOption = productUnitOptions[i];
        const available = singleOption.getAttribute('data-available');
        const optionColor = singleOption.getAttribute('data-option1');

        if(color === optionColor) {
            if(!onlyAvailable || available == 'true') {
                match = singleOption;
                break;
            } else {
                backupMatch = singleOption;
            }
        } else if(match === false && available == 'true' && colorGroup.colors.indexOf(optionColor) > -1) match = singleOption;
    }

    if(match === false && backupMatch !== false) match = backupMatch;

    return match;
}

function matchProductUnitsToOption(productUnits, option, onlyAvailable = true) {
    const color = option.getAttribute('data-option1');
    const colorGroup = getColorGroup(color);
    
    productUnits.forEach(productUnit => {
        const match = getProductUnitColorMatch(productUnit, color, colorGroup, onlyAvailable);

        if(match) productUnit.querySelector(`.color-swatch[data-value="${match.getAttribute('data-option1')}"]`).click();
    });
}

function pdpHandleUpsell(option) {
    const productUnits = document.querySelectorAll('.pdp__upsell .product-unit');

    let promises = [];
    productUnits.forEach(product => {
        if(!product.classList.contains('product-unit--loaded')) promises.push(activateProductUnit(product))
    });

    if(promises.length == 0) return matchProductUnitsToOption(productUnits, option);

    Promise.all(promises).then(() => matchProductUnitsToOption(productUnits, option));
}

function pdpHandleFeaturedCollection(option) {
    const productUnits = document.querySelectorAll('.shopify-section--pdp-featured .product-unit');

    let promises = [];
    productUnits.forEach(product => {
        if(!product.classList.contains('product-unit--loaded')) promises.push(activateProductUnit(product))
    });

    if(promises.length == 0) return matchProductUnitsToOption(productUnits, option, false);

    Promise.all(promises).then(() => matchProductUnitsToOption(productUnits, option, false));
}

function pdpUpdateURL(product, opt1) {
    let url_vars = ''; 
    if(document.location.href.indexOf('?') > -1) {
        url_vars = document.location.href.split('?');
        url_vars = '?' + url_vars[1];
    }

    let attr = '';
        // if(size_template) attr = handleize(variant.option2);
        // else 
    // attr = handleize(variant.option1);
    attr = opt1;

    // if(selector.variantIdField.options[selector.variantIdField.selectedIndex].classList.contains('early-access-option')) attr = 'early-access-' + attr;

    let not_ea_url = document.location.href.indexOf('/early-access') === -1 || document.location.href.indexOf('/early-access-') > -1;
    if(document.location.href.indexOf('?preview_key=') === -1 && not_ea_url) window.history.replaceState({}, '', '/products/' + product.handle + '/' + attr + url_vars);
}

function pdpHandleDescriptions(pdpInfo, option) {
    const actives = pdpInfo.querySelectorAll('[data-variant][data-current]');
    actives.forEach(active => active.removeAttribute('data-current'));

    const toActivate = pdpInfo.querySelectorAll(`[data-variant="${option.value}"]`);
    toActivate.forEach(toAct => toAct.setAttribute('data-current', ''));
}

function productUnitUpdateHover(option, productImageContainer) {
    let hoverImg = productImageContainer.querySelector('.img-hover');
    if(option.hasAttribute('data-hover')) {
        const hover = option.getAttribute('data-hover');

        if(hover) {
            if(hoverImg) hoverImg.setAttribute('srcset', lazyloadImageSrcset(hover));
            else {
                hoverImg = document.createElement('img');
                hoverImg.setAttribute('src', hover);
                hoverImg.setAttribute('srcset', lazyloadImageSrcset(hover));
                hoverImg.classList.add('img-hover');
                productImageContainer.appendChild(hoverImg);
            }
        } else if(hoverImg) hoverImg.remove();
    } else if(hoverImg) hoverImg.remove();
}

function variantUpdateProcess(target) {
    const productContainer = target.closest('.product-unit, .shopify-product-form');
    if(!productContainer) return;

    const select = productContainer.querySelector('.variant-select');
    if(!select) return;

    let location = false;
    if(productContainer.classList.contains('product-unit')) location = 'unit';
    else if(productContainer.classList.contains('shopify-product-form')) location = 'pdp';

    let options = getProductOptionsList(productContainer, location);
    
    let selector = `option`;
    for(let i = 0; i < options.length; i++) selector += `[data-option${i + 1}="${options[i]}"]`;

    const option = select.querySelector(selector);
    if(!option) return;
    select.value = option.value;

    if(location == 'pdp') updateOptionsAvailability(options, select);

    let price = option.getAttribute('data-price');
    let cprice = false;
    if(option.hasAttribute('data-cprice')) cprice = option.getAttribute('data-cprice');
    let formatedPrice = `<b>${formatPrice(price / 100)}</b>`;
    if(cprice) formatedPrice = `<s>${formatPrice(cprice / 100)}</s>` + formatedPrice;
    
    const optionalLabels = productContainer.closest('.product-unit, .pdp__grid, .qv__body').querySelectorAll('.product-label[data-options]');
    optionalLabels.forEach(optionalLabel => {
        if(optionalLabel.matches(`[data-options~="${options[0]}"]`) || optionalLabel.matches(`[data-options~="${option.value}"]`)) optionalLabel.classList.add('product-label--active');
        else optionalLabel.classList.remove('product-label--active');
    });

    if(location == 'unit') {
        const img = option.getAttribute('data-image');
        
        if(option.getAttribute('data-available') == 'false') productContainer.classList.add('product-unit--na');
        else productContainer.classList.remove('product-unit--na');
        
        productContainer.querySelector('.product-unit__price').innerHTML = formatedPrice;
        
        const pdpDscnts = productContainer.querySelectorAll('.dscnt');
        let discount = '';
        if(cprice) discount = Math.round((cprice - price) * 100 / cprice);
        pdpDscnts.forEach(pdpDscnt => pdpDscnt.innerHTML = `${discount}%`);

        if(productContainer.classList.contains('adding-to-cart')) productContainer.classList.remove('adding-to-cart');
        if(productContainer.classList.contains('added-to-cart')) productContainer.classList.remove('added-to-cart');

        const productImageContainer = productContainer.querySelector('.product-unit__image');
        
        if(img) productImageContainer.querySelector('img').setAttribute('srcset', lazyloadImageSrcset(img));

        productUnitUpdateHover(option, productImageContainer);

    } else if(location == 'pdp') {
        const pdpInfo = productContainer.closest('.pdp__info, .qv__product');
        const pdpGrid = productContainer.closest('.pdp__grid, .qv__body');
        const isQuickView = pdpGrid.classList.contains('qv__body');

        let preorderLabels = productContainer.querySelectorAll('.product-label--preorder');
        preorderLabels.forEach(preorderLabel => preorderLabel.classList.remove('product-label--active'));

        if(option.getAttribute('data-available') == 'false') {
            pdpGrid.setAttribute('data-status', 'sold-out');

            const waitlist = pdpGrid.querySelector('.pdp__waitlist--success');
            if(waitlist) waitlist.classList.remove('pdp__waitlist--success');

            const submitCont = pdpGrid.querySelector('.pdp__submit-container');
            if(submitCont.hasAttribute('data-soldout')) {
                if(submitCont.matches(`[data-soldout~=${options[0]}]`)) submitCont.classList.add('pdp__submit-container--soldout');
                else submitCont.classList.remove('pdp__submit-container--soldout');
            }
        } else {
            let preorder = false;
            if(option.hasAttribute('data-preorder')) preorder = option.getAttribute('data-preorder');

            if(preorder) {
                pdpGrid.setAttribute('data-status', 'preorder');

                preorderLabels.forEach(preorderLabel => {
                    preorderLabel.classList.add('product-label--active');
                    preorderLabel.querySelector('.preorder-date').innerHTML = preorder;
                });
            } else {
                pdpGrid.setAttribute('data-status', 'default');
            }
        }

        const qty = option.getAttribute('data-qty');
        const stock = pdpInfo.querySelector('.pdp__stock');
        if(qty) {
            stock.querySelector('span').innerHTML = qty;
            stock.classList.add('pdp__stock--active');
        } else stock.classList.remove('pdp__stock--active');

        pdpInfo.querySelector('.pdp__payments-amnt').innerHTML = formatPrice(price / 4 / 100);

        const pdpPrices = pdpInfo.querySelectorAll('.pdp__price-inner, .pdp__submit-price');
        pdpPrices.forEach(pdpPrice => pdpPrice.innerHTML = formatedPrice);

        const pdpDscnts = pdpGrid.querySelectorAll('.dscnt');
        let discount = '';
        if(cprice) discount = Math.round((cprice - price) * 100 / cprice);
        pdpDscnts.forEach(pdpDscnt => pdpDscnt.innerHTML = `${discount}%`);

        pdpGalleryUpdate(pdpGrid, option, isQuickView);

        if(!isQuickView) {
            pdpHandleUpsell(option);
            pdpHandleDescriptions(pdpInfo, option);
            pdpHandleFeaturedCollection(option);
            pdpUpdateURL(product, options[0]);
        }
    }
}