"use strict";

let product = false;
let productMeta = false;
let klaviyoLoaded = false;

const pdpJSON = document.querySelector('.pdp-json');
const pdpMetaJSON = document.querySelector('.pdp-meta-json');
if(pdpJSON) {
    try {
        productMeta = JSON.parse(pdpMetaJSON.innerHTML);
    } catch( e ) {
        console.log('ERROR', e);
    }

    try {
        product = JSON.parse(pdpJSON.innerHTML);
        
        setProductData(product, productMeta, document.querySelector('.pdp__variants'), pdpJSON.getAttribute('data-current-variant'));
    } catch( e ) {
        console.log('ERROR', e);
    }
}

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

        if(match) {
            const newSwatch = productUnit.querySelector(`.color-swatch[data-value="${match.getAttribute('data-option1')}"]`);
            
            const activeFirst = productUnit.querySelector('.color-swatch--first');
            if(activeFirst) activeFirst.classList.remove('color-swatch--first');
            
            newSwatch.classList.add('color-swatch--first');
            newSwatch.click();
        }
    });
}

function pdpCreateTypeSelect(variantTypeEl, product, quickView = false) {
    const pdpFeaturedCollection = variantTypeEl.getAttribute('data-collection');
    const productTypes = ['Mini Carry-On', 'Front Pocket Carry-On', 'Carry-On', 'Medium Luggage', 'Large Luggage', 'Trunk Luggage', '2-Piece Set', '3-Piece Set', '2-Piece Luggage Set', '3-Piece Luggage Set'];
    let foundTypes = [];
    fetch(`/collections/${pdpFeaturedCollection}/products.json`)
    .then(response => response.json())
    .then(data => {
        let selectedAssigned = false;
        let added = [];
        for(let j = 0; j < productTypes.length; j++) {
            let selected = false;
            if(selectedAssigned === false && product.title.indexOf(productTypes[j]) > -1) {
                selectedAssigned = true;
                selected = true;
            }

            for(let i = 0; i < data.products.length; i++) {
                let prod = data.products[i];
                if(prod.title.indexOf(productTypes[j]) > -1 && added.indexOf(prod.handle) === -1) {
                    let correctVariantPrice;  

                    if(prod.handle === product.handle) {
                      // getting the variantion selectedAssigned
                      correctVariantPrice = prod.variants.find(variant => variant.option1.toLowerCase() === window.location.pathname.split('/')[window.location.pathname.split('/').length -1 ])?.price || prod.variants[0].price;
                    } else {
                      correctVariantPrice = prod.variants[0].price
                    }
                    foundTypes.push([
                        productTypes[j],
                        prod.handle,
                        correctVariantPrice,
                        prod.id == product.id
                    ]);
                    added.push(prod.handle);
                    break;
                }
            }
        }

        const select = variantTypeEl.querySelector('select');
        let selectOptions = '';
        foundTypes.forEach(foundType => {
            selectOptions += `<option ${foundType[3]?'selected':''} value="${foundType[1]}">${foundType[0]} - ${formatPrice(foundType[2])}</option>`;
        });

        select.innerHTML = selectOptions;
        select.classList.add('select__wrapper--pdp-active');

        select.addEventListener('change', (e) => {
            const productForm = variantTypeEl.closest('.shopify-product-form');
            const options = getProductOptionsList(productForm, 'pdp');
            let url = `/products/${e.target.value}`;
            
            if(quickView === false) {
                location.href = url + '/' + options[0];
            } else {
                getQuickView(url, options[0]);
            }
        });
    });
}

async function pdpFormSubmit(productForm, showCart = true) {
    const container = productForm.closest('.pdp__grid, .qv__body');

    if(container.getAttribute('data-status') == 'sold-out') return;
    
    productForm.classList.add('shopify-product-form--loading');
    if(typeof openCart == 'undefined') await activateCart();

    const select = productForm.querySelector('[name="id"]');
    const variant_id = select.value;

    addToCart(variant_id, 1, (data) => {
            updateCart(data);
            console.log("SE AGREGA");
            if(showCart) {
                openCart();
            } else {
                productForm.querySelector('.pdp__submit').classList.add('pdp__submit--added');
                setTimeout(() => productForm.querySelector('.pdp__submit').classList.remove('pdp__submit--added'), 2000);
            }
        }, () => {
            productForm.classList.remove('shopify-product-form--loading');
        },
        select.options[select.selectedIndex].hasAttribute('data-final-sale'),
        select.options[select.selectedIndex].getAttribute('data-preorder')
    );
}

function updateOptionsAvailability(options, select, container) {
    for(let i = 0; i < options.length; i++) {
        const siblingOptions = select.querySelectorAll(`option[data-option${i + 1}="${options[i]}"]`);
        for(let j = 0; j < siblingOptions.length; j++) {
            const option = siblingOptions[j];
            for(let optNum = 0; optNum < options.length; optNum++) {
                if(optNum == i) continue;
                
                const value = option.getAttribute(`data-option${optNum + 1}`);
                const available = option.getAttribute('data-available');
                const target = container.querySelector(`.pdp__variants [data-position="${optNum + 1}"] [data-value="${value}"]`);

                if(target) {
                    if(available === false || available == 'false') target.classList.add('product-option--na');
                    else target.classList.remove('product-option--na');
                }
            }
        }
    }
}

async function triggerWaitlist(waitlistCont) {
    const emailField = waitlistCont.querySelector('.mailing-list-email');
    const email = emailField.value.trim();
    const productForm = waitlistCont.closest('.shopify-product-form');
    const productId = productForm.getAttribute('data-id');

    if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const variantId = productForm.querySelector('.variant-select').value;

        waitlistCont.classList.remove('pdp__waitlist--error');
        waitlistCont.classList.add('pdp__waitlist--loading');
        
        if(klaviyoLoaded == false) {
            await loadScript(scripts.klaviyo);
            klaviyoLoaded = true;
        }

        const formData = new FormData();
        formData.append("a", "M38Kem");
        formData.append("email", email);
        formData.append("variant", variantId);
        formData.append("product", productId);
        formData.append("platform", "shopify");
        formData.append("subscribe_for_newsletter", true);
        formData.append("g", "JuPuvw");

        fetch('https://a.klaviyo.com/onsite/components/back-in-stock/subscribe', {
            method: 'POST',
            body: formData
        })
        .then((response) => {
            if(!response.ok) {
                waitlistCont.classList.add('pdp__waitlist--error');
                emailField.setAttribute("aria-invalid", "true");
                emailField.setAttribute("aria-describedby", `waitlist-error--${productId}`);
            } else {
                waitlistCont.classList.add('pdp__waitlist--success');
                emailField.setAttribute("aria-invalid", "false");
                emailField.setAttribute("aria-describedby", `waitlist-success--${productId}`);
            }
        })
        .catch(() => {
            waitlistCont.classList.add('pdp__waitlist--error');
            emailField.setAttribute("aria-invalid", "true");
            emailField.setAttribute("aria-describedby", `waitlist-error--${productId}`);
        })
        .then(() => waitlistCont.classList.remove('pdp__waitlist--loading'));
    } else {
        waitlistCont.classList.add('pdp__waitlist--error');
        emailField.setAttribute("aria-invalid", "true");
        emailField.setAttribute("aria-describedby", `waitlist-error--${productId}`);
    }
}

function bindWaitlist(container) {
    const waitlistCheckboxes = container.querySelectorAll('.mailing-list-checkbox');

    waitlistCheckboxes.forEach(waitlistCheckbox => waitlistCheckbox.addEventListener('click', function() {
        if(this.checked) {
            this.closest('.pdp__waitlist').classList.remove('pdp__waitlist--inactive');
        } else this.closest('.pdp__waitlist').classList.add('pdp__waitlist--inactive');
    }));

    const waitlistSubmitBtns = container.querySelectorAll('.pdp__waitlist-submit');
    waitlistSubmitBtns.forEach(waitlistSubmitBtn => waitlistSubmitBtn.addEventListener('click', async function() {
        const waitlistCont = this.closest('.pdp__waitlist');
        triggerWaitlist(waitlistCont);
    }));

    const waitlistInputs = container.querySelectorAll('.pdp__waitlist input[type="email"]');
    waitlistInputs.forEach(waitlistInput => waitlistInput.addEventListener('keyup', function(event) {
        if (event.defaultPrevented) return;

        if((typeof event.key != 'undefined' && event.key === "Enter") || event.keyCode === 13) {
            event.preventDefault();
            event.stopPropagation();
            const waitlistCont = this.closest('.pdp__waitlist');
            triggerWaitlist(waitlistCont);
        }
    }));
}



window.addEventListener("load", () => {
    const pdpGrid = document.querySelector('.pdp__grid');

    let pdpSwatchesCheckThrottle = false;
    const pdpSwatches = document.querySelectorAll('.pdp__swatches');
    window.addEventListener("resize", checkPDPSwatches);
    function checkPDPSwatches() {
        if(pdpSwatchesCheckThrottle !== false) clearTimeout(pdpSwatchesCheckThrottle);
    
        pdpSwatchesCheckThrottle = setTimeout(() => {
            pdpSwatches.forEach(pdpSwatch => {
                pdpSwatch.style.setProperty('--max-fit', Math.floor(pdpSwatch.offsetWidth / 28));
            });
        }, 20);
    }
    checkPDPSwatches();

    const bambuserButton = document.querySelector('.bambuser__live-activator button');
    if(bambuserButton) bambuserButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });

    const reviewsLink = document.querySelector('.pdp__grid .pdp__reviews');
    if(reviewsLink) reviewsLink.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector('.okeReviews-widget-holder').scrollIntoView({behavior: 'smooth'});
    });

    if(pdpGrid) {
        let variantTypeEl = document.querySelector('.pdp__variant-type');
        if(variantTypeEl) pdpCreateTypeSelect(variantTypeEl, product);

        const pdpSubmitSection = document.querySelector('.pdp__submit-container');
        const floatingPDPSubmit = document.querySelector('.pdp__floating-submit');
        if(floatingPDPSubmit && pdpSubmitSection) {
            let observer = new IntersectionObserver(function(entries){
                entries.forEach(entry => {
                    if (entry.intersectionRatio > 0) {
                        floatingPDPSubmit.classList.remove('pdp__floating-submit--active');
                    } else floatingPDPSubmit.classList.add('pdp__floating-submit--active');
                });
            }, {threshold: 0, rootMargin: '0px'});

            observer.observe(pdpSubmitSection);
        }

        const select = pdpGrid.querySelector('.variant-select');
        pdpGalleryUpdate(pdpGrid, select.options[select.selectedIndex], false);

        const featuredCollectionProducts = document.querySelectorAll('.shopify-section--pdp-featured .product-unit');
        featuredCollectionProducts.forEach(featuredCollectionProduct => featuredCollectionProduct.setAttribute('data-init-1', select.options[select.selectedIndex].getAttribute('data-option1')));

        updateOptionsAvailability(getProductOptionsList(pdpGrid), select, pdpGrid);

        let galleryMoreBtn = document.querySelector('.pdp-gallery__more-btn');
        if(galleryMoreBtn) galleryMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const cont = this.closest('.pdp__gallery-container');
            if(cont) cont.classList.add('pdp__gallery-container--expanded');
            const wideMedia = cont.querySelectorAll('.pdp__media--wide');
            if(wideMedia.length > 1) for(let i = 1; i < wideMedia.length; i++) wideMedia[i].classList.remove('pdp__media--wide');
            const allMedia = cont.querySelectorAll('.pdp__media.pdp__media--active');

            if(allMedia.length % 2 == 0) {
                allMedia[allMedia.length - 1].classList.add('pdp__media--wide');
            }
        });

        const allMediaZoom = document.querySelectorAll('.pdp__media .img-zoom');
        allMediaZoom.forEach(media => media.addEventListener('mousemove', function(e) {
            let left = 0;
            let top = 0;

            if(this.closest('.pdp__media').classList.contains('pdp__media--wide')) {
                top = (e.offsetY / this.offsetHeight) * -66.66;
                left = (e.offsetX / this.offsetWidth) * -33.33;
            } else {
                top = (e.offsetY / this.offsetHeight) * -50;
                left = (e.offsetX / this.offsetWidth) * -50;
            }

            this.style.transform = `translate3d(${left}%, ${top}%, 0)`;
        }));

        const productForm = document.querySelector('.shopify-product-form');
        if(productForm) productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            pdpFormSubmit(productForm, true);
        });

        bindWaitlist(pdpGrid);
    }
});

function setupGalleryMediaLimit(newMedia) {
    let mediaLimit = 0;

    if(typeof pdpSettings != 'undefined') {
        const galleryMoreBtn = document.querySelector('.pdp-gallery__more-btn');
        mediaLimit = pdpSettings.gallery_limit;
        
        if(mediaLimit < newMedia.length) {
            galleryMoreBtn.classList.add('pdp-gallery__more-btn--active');

            if(pdpSettings.reapply_limit) {
                document.querySelector('.pdp-gallery__more-btn .img-num').innerHTML = newMedia.length - mediaLimit;

                let expandedCont = document.querySelector('.pdp__gallery-container--expanded');
                if(expandedCont) expandedCont.classList.remove('pdp__gallery-container--expanded');
            }
        } else galleryMoreBtn.classList.remove('pdp-gallery__more-btn--active');
    }

    return mediaLimit;
}

function pdpGalleryUpdate(pdpGrid, option, isQuickView) {
    let variantTypeEl = document.querySelector('.pdp__variant-type');
    if(variantTypeEl) pdpCreateTypeSelect(variantTypeEl, product);
    const pdpGallery = pdpGrid.querySelector('.pdp__gallery, .qv__gallery');
    const pdpThumbs = pdpGrid.querySelector('.pdp__gallery-thumbs, .qv__gallery-thumbs');
    const pdpGalleryInfo = pdpGrid.querySelector('.pdp__video-info');

    let pdpSlides = pdpGallery;
    let pdpThumbSlides = pdpThumbs;
    if(isQuickView) {
        pdpSlides = pdpGallery.querySelector('.qv__gallery-inner');
        pdpThumbSlides = pdpThumbs.querySelector('.qv__gallery-thumbs-inner');
    }

    let pdpVideoOrder = false;
    if(pdpGallery.hasAttribute('data-video-order')) pdpVideoOrder = pdpGallery.getAttribute('data-video-order');

    const allMedia = pdpGallery.querySelectorAll('.pdp__media');
    allMedia.forEach(mediaActive => mediaActive.classList.remove('pdp__media--active', 'pdp__media--wide', 'pdp__media--extra', 'slide'));
    
    const allThumbs = pdpThumbs.querySelectorAll('.pdp__media-thumb');
    allThumbs.forEach(mediaActive => mediaActive.classList.remove('pdp__media--active', 'slide'));

    let newMedia = [];
    let newMediaThumbs = [];
    
    if(pdpGallery.classList.contains('pdp__gallery--old')) {
        let sku = option.getAttribute('data-sku');
        let color = option.getAttribute('data-option1');
        newMedia = pdpGallery.querySelectorAll(`.pdp__media[data-variants=""],.pdp__media[data-variants~="${sku}"],.pdp__media[data-variants~="${color}"]`);
        newMediaThumbs = pdpThumbs.querySelectorAll(`.pdp__media-thumb[data-variants=""],.pdp__media-thumb[data-variants~="${sku}"],.pdp__media-thumb[data-variants~="${color}"]`);
    } else {
        newMedia = pdpGallery.querySelectorAll(`.pdp__media[data-id=""],.pdp__media[data-id="${option.value}"]`);
        newMediaThumbs = pdpThumbs.querySelectorAll(`.pdp__media-thumb[data-id=""],.pdp__media-thumb[data-id="${option.value}"]`);
    }

    if(pdpGalleryInfo) {
        if(option.hasAttribute('data-video-info')) {
            const videoInfo = option.getAttribute('data-video-info');
            if(videoInfo) pdpGalleryInfo.innerHTML = videoInfo;
            else pdpGalleryInfo.innerHTML = '';
        } else pdpGalleryInfo.innerHTML = '';
    }

    if(newMedia.length > 0) {
        let mediaVarVideo = false;
        let mediaProdVideo = false;
        let pdpVideoCurrentOrder = 0;
        
        for(let i = 0; i < newMedia.length; i++) {
            let newMed = newMedia[i];
            
            let videoContainer = newMed.querySelector('.video-iframe-container');
            if(videoContainer) {
                if(newMed.classList.contains('pdp__media--prod-video')) {
                    mediaProdVideo = newMed;
                    pdpVideoCurrentOrder = i;
                }
                if(newMed.classList.contains('pdp__media--var-video')) mediaVarVideo = newMed;
                continue;
            }
            
            newMed.classList.add('pdp__media--active', 'slide');
            // if(videoContainer && !videoContainer.querySelector('iframe')) activateVideoContainer(videoContainer);
        }
        
        if(mediaVarVideo !== false) {
            mediaVarVideo.classList.add('pdp__media--active', 'slide');
            let videoContainer = mediaVarVideo.querySelector('.video-iframe-container');
            // if(videoContainer && !videoContainer.querySelector('iframe')) activateVideoContainer(videoContainer);
        } else if(mediaProdVideo !== false) {
            mediaProdVideo.classList.add('pdp__media--active', 'slide');
            
            if(pdpVideoOrder !== false) {
                if(pdpVideoCurrentOrder < pdpVideoOrder - 1) {
                    pdpSlides.insertBefore(mediaProdVideo, newMedia[pdpVideoOrder]);
                } else if(pdpVideoCurrentOrder > pdpVideoOrder - 1) {
                    pdpSlides.insertBefore(mediaProdVideo, newMedia[pdpVideoOrder - 1]);
                }
            }
            
            let videoContainer = mediaProdVideo.querySelector('.video-iframe-container');
            // if(videoContainer && !videoContainer.querySelector('iframe')) activateVideoContainer(videoContainer);
        }
        
        pdpGallery.scrollLeft = 0;
        
        let activeMedia = pdpGallery.querySelectorAll('.pdp__media--active');
        activeMedia[0].classList.add('pdp__media--wide');
        if(!isQuickView) {
            let mediaLimit = setupGalleryMediaLimit(newMedia);
            if(mediaLimit && mediaLimit > 0) {
                for(let i = 0; i < activeMedia.length; i++) {
                    if(mediaLimit % 2 === 0 && i == mediaLimit - 1) activeMedia[i].classList.add('pdp__media--wide');
                    else if(i >= mediaLimit) activeMedia[i].classList.add('pdp__media--extra');
                }
            }
        }
    }

    if(newMediaThumbs.length > 0) {
        let mediaVarVideo = false;
        let mediaProdVideo = false;
        let pdpVideoCurrentOrder = 0;

        const selected = pdpThumbs.querySelector('.slide--selected');
        if(selected) selected.classList.remove('slide--selected');

        for(let i = 0; i < newMediaThumbs.length; i++) {
            let newMed = newMediaThumbs[i];

            let videoContainer = newMed.querySelector('.video-link-image');
            if(videoContainer) {
                if(newMed.classList.contains('pdp__media--prod-video')) {
                    mediaProdVideo = newMed;
                    pdpVideoCurrentOrder = i;
                }
                if(newMed.classList.contains('pdp__media--var-video')) mediaVarVideo = newMed;
                continue;
            }

            newMed.classList.add('pdp__media--active', 'slide');
            // if(videoContainer && !videoContainer.querySelector('iframe')) activateVideoContainer(videoContainer);
        }

        pdpThumbs.scrollLeft = 0;
        const firstActive = pdpThumbs.querySelector('.pdp__media--active');
        if(firstActive) firstActive.classList.add('slide--selected');

        if(mediaVarVideo !== false) {
            mediaVarVideo.classList.add('pdp__media--active', 'slide');
            // let videoContainer = mediaVarVideo.querySelector('.video-iframe-container');
            // if(videoContainer && !videoContainer.querySelector('iframe')) activateVideoContainer(videoContainer);
        } else if(mediaProdVideo !== false) {
            mediaProdVideo.classList.add('pdp__media--active', 'slide');

            if(pdpVideoOrder !== false) {
                if(pdpVideoCurrentOrder < pdpVideoOrder - 1) {
                    pdpThumbSlides.insertBefore(mediaProdVideo, newMediaThumbs[pdpVideoOrder]);
                } else if(pdpVideoCurrentOrder > pdpVideoOrder - 1) {
                    pdpThumbSlides.insertBefore(mediaProdVideo, newMediaThumbs[pdpVideoOrder - 1]);
                }
            }

            // let videoContainer = mediaProdVideo.querySelector('.video-iframe-container');
            // if(videoContainer && !videoContainer.querySelector('iframe')) activateVideoContainer(videoContainer);
        }

        // let mediaLimit = isQuickView?false:setupGalleryMediaLimit(newMedia);
        // if(mediaLimit && mediaLimit > 0 && mediaLimit % 2 === 0) {
        //     let activeMedia = pdpThumbs.querySelectorAll('.pdp__media--active');
        //     for(let i = 0; i < activeMedia.length; i++) {
        //         if(i == mediaLimit - 1 || i == 0) activeMedia[i].classList.add('pdp__media--wide');
        //         else if(i >= mediaLimit) activeMedia[i].classList.add('pdp__media--extra');
        //     }
        // }

        checkSlider(pdpThumbs.querySelector('.slider'));
    }
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

function pdpUpdateURL(product, options) {
    let url_vars = ''; 
    if(document.location.href.indexOf('?') > -1) {
        url_vars = document.location.href.split('?');
        url_vars = '?' + url_vars[1];
    }

    let attr = options[0];//options.join(',');
    // if(options.length > 1) {
    //     let option1Only = true,
    //         tmp = false;
    //     for(let i = 0; i < product.variants.length; i++) {
    //         if(tmp === false) tmp = product.variants[i].option2;
    //         else if(tmp != product.variants[i].option2) {
    //             option1Only = false;
    //             break;
    //         }
    //     }

    //     if(option1Only) attr = options[0];
    //     else 
    // } else attr = options[0];

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
window.addEventListener("load", function(){
    const variantLuggageButton = document.querySelector('.product-option.product-option--selected');
    if (variantLuggageButton != -1){
    variantLuggageButton.click();
    } 
});