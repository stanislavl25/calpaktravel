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
                productImageContainer.appendChild(hoverImg);
            }
        } else if(hoverImg) hoverImg.remove();
    } else if(hoverImg) hoverImg.remove();
}

function updateProductURLs(productContainer, options) {
    const handle = productContainer.getAttribute('data-handle');
    const productLinks = productContainer.querySelectorAll('.product-link');
    productLinks.forEach(productLink => {
        productLink.setAttribute('href', `/products/${handle}/${options.join(',')}`);
    });
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

    updateProductURLs(productContainer, options);
    
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
        if(optionalLabel.matches(`[data-options~="${options[0]}"]`) || optionalLabel.matches(`[data-options~="${option.value}"]`)) optionalLabel.classList.add('product-label--active');
        else optionalLabel.classList.remove('product-label--active');
    });

    if(location == 'unit') {
        const img = option.getAttribute('data-image');
        
        if(option.getAttribute('data-available') == 'false') productContainer.classList.add('product-unit--na');
        else productContainer.classList.remove('product-unit--na');
        
        productContainer.querySelector('.product-unit__price').innerHTML = formatedPrice;
        
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

        let preorderLabels = productContainer.querySelectorAll('.product-label--preorder');
        preorderLabels.forEach(preorderLabel => preorderLabel.classList.remove('product-label--active'));

        if(option.getAttribute('data-available') == 'false') {
            pdpGrid.setAttribute('data-status', 'sold-out');

            const waitlist = pdpGrid.querySelector('.pdp__waitlist--success');
            if(waitlist) waitlist.classList.remove('pdp__waitlist--success');

            if(pdpGrid.hasAttribute('data-soldout')) {
                if(pdpGrid.matches(`[data-soldout~=${options[0]}]`)) pdpGrid.classList.add('pdp__grid--soldout');
                else pdpGrid.classList.remove('pdp__grid--soldout');
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

        if(!isQuickView) {
            pdpHandleUpsell(option);
            pdpHandleDescriptions(pdpInfo, option);
            pdpHandleFeaturedCollection(option);
            pdpUpdateURL(product, options);
        }
    }
}