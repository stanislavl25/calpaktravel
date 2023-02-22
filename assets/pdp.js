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

function pdpCreateTypeSelect(variantTypeEl, product, quickView = false) {
    const pdpFeaturedCollection = variantTypeEl.getAttribute('data-collection');
    const productTypes = ['Mini Carry-On', 'Carry-On', 'Carry-On Luggage with Hardshell Pocket', 'Carry-On Luggage with Pocket', 'Medium Luggage', 'Large', 'Trunk', '2-Piece Set', '3-Piece Set', '2-Piece Luggage Set', '3-Piece Luggage Set'];
    let foundTypes = [];
    fetch(`/collections/${pdpFeaturedCollection}/products.json`)
    .then(response => response.json())
    .then(data => {
        let selectedAssigned = false;
        for(let j = 0; j < productTypes.length; j++) {
            let selected = false;
            if(selectedAssigned === false && product.title.indexOf(productTypes[j]) > -1) {
                selectedAssigned = true;
                selected = true;
            }

            for(let i = 0; i < data.products.length; i++) {
                let prod = data.products[i];
                if(prod.title.indexOf(productTypes[j]) > -1) {
                    foundTypes.push([
                        productTypes[j],
                        prod.handle,
                        prod.variants[0].price,
                        selected
                    ]);
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
            const url = `/products/${e.target.value}`;
            if(quickView === false) location.href = url;
            else getQuickView(url);
        });
    });
}

async function pdpFormSubmit(productForm) {
    const container = productForm.closest('.pdp__grid, .qv__body');

    if(container.getAttribute('data-status') == 'sold-out') return;
    
    productForm.classList.add('shopify-product-form--loading');
    if(typeof openCart == 'undefined') await activateCart();

    const select = productForm.querySelector('[name="id"]');
    const variant_id = select.value;

    addToCart(variant_id, 1, (data) => {
            updateCart(data);
            openCart();
        }, () => {
            productForm.classList.remove('shopify-product-form--loading');
        },
        select.options[select.selectedIndex].hasAttribute('data-final-sale'),
        select.options[select.selectedIndex].getAttribute('data-preorder')
    );
}

function updateOptionsAvailability(options, select) {
    for(let i = 0; i < options.length; i++) {
        const siblingOptions = select.querySelectorAll(`option[data-option${i + 1}="${options[i]}"]`);
        for(let j = 0; j < siblingOptions.length; j++) {
            const option = siblingOptions[j];
            for(let optNum = 0; optNum < options.length; optNum++) {
                if(optNum == i) continue;
                
                const value = option.getAttribute(`data-option${optNum + 1}`);
                const available = option.getAttribute('data-available');
                const target = document.querySelector(`.pdp__variants [data-position="${optNum + 1}"] [data-value="${value}"]`);

                if(target) {
                    if(available === false || available == 'false') target.classList.add('product-option--na');
                    else target.classList.remove('product-option--na');
                }
            }
        }
    }
}

async function triggerWaitlist(waitlistCont) {
    const trigger = waitlistCont.querySelector('.klaviyo-bis-trigger');
    waitlistCont.classList.add('pdp__waitlist--loading');
    if(klaviyoLoaded == false) {
        await loadScript(scripts.klaviyo);
        waitlistCont.classList.remove('pdp__waitlist--loading');
        waitlistCont.classList.add('pdp__waitlist--success');
        // initKlaviyo();
    }

    setTimeout(() => {
        trigger.click();
    }, 2000);
    // console.log(document.querySelector('#klaviyo-bis-iframe').contentDocument.querySelector('input[type="email"]'));
}

window.addEventListener("load", () => {
    const pdpGrid = document.querySelector('.pdp__grid');

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

        updateOptionsAvailability(getProductOptionsList(pdpGrid), select);

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
            pdpFormSubmit(productForm);
        });

        const waitlistSubmitBtn = document.querySelector('.pdp__waitlist-submit');
        if(waitlistSubmitBtn) waitlistSubmitBtn.addEventListener('click', async function() {
            const waitlistCont = this.closest('.pdp__waitlist');
            triggerWaitlist(waitlistCont);
        });

        const waitlistInput = document.querySelector('.pdp__waitlist input[type="email"]');
        if(waitlistInput) waitlistInput.addEventListener('keyup', function(event) {
            if (event.defaultPrevented) return;

            if((typeof event.key != 'undefined' && event.key === "Enter") || event.keyCode === 13) {
                event.preventDefault();
                event.stopPropagation();
                const waitlistCont = this.closest('.pdp__waitlist');
                triggerWaitlist(waitlistCont);
            }
        });
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
    const pdpGallery = pdpGrid.querySelector('.pdp__gallery, .qv__gallery');
    const pdpThumbs = pdpGrid.querySelector('.pdp__gallery-thumbs, .qv__gallery-thumbs');

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
        
        
        let activeMedia = pdpGallery.querySelectorAll('.pdp__media--active');
        if(isQuickView) {
            activeMedia[0].classList.add('pdp__media--wide');
        } else {
            let mediaLimit = setupGalleryMediaLimit(newMedia);
            if(mediaLimit && mediaLimit > 0 && mediaLimit % 2 === 0) {
                for(let i = 0; i < activeMedia.length; i++) {
                    if(i == mediaLimit - 1 || i == 0) activeMedia[i].classList.add('pdp__media--wide');
                    else if(i >= mediaLimit) activeMedia[i].classList.add('pdp__media--extra');
                }
            }
        }
    }

    if(newMediaThumbs.length > 0) {
        let mediaVarVideo = false;
        let mediaProdVideo = false;
        let pdpVideoCurrentOrder = 0;

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
    }
}

function initKlaviyo() {
    let klaviyo = window.klaviyo || false;
    if(klaviyo !== false) {
        klaviyoLoaded = true;
        klaviyo.logging(false);
        
        if(document.querySelector('.pdp__grid')) {
            klaviyo.init({
                account: "M38Kem",
                list: 'JuPuvw',
                logging: false,
                platform: "shopify"
            });
    
            klaviyo.enable("backinstock");
        }
        else {
            klaviyo.init({
                account: "M38Kem",
                platform: "shopify",
                list: 'JuPuvw',
                logging: false,
                collection_urls: ["/", "/collections/"]
            });
    
            klaviyo.enable("backinstock", {
                trigger: {
                    collection_page_class: 'button',    
                    collection_page_text_align: 'center',    
                    collection_page_width: '200px',    
                    collection_page_text: 'Notify Me When Available',    
                    collection_page_padding: 'inherit'
                    // replace_anchor: false,
                    // replace_sold_out: true
                },
                modal: {
                    newsletter_subscribe_label: "Add me to the mailing list!",
                    headline: "Join the waitlist",
                    body_content: "",
                    email_field_label: "Your Email Address",
                    button_label: "SUBMIT",
                    subscription_success_label: "You've been added!",
                    footer_content: '',
                    additional_styles: "@import url(https://use.typekit.net/hxi1sdz.css);body.fadein{background:rgba(0, 0, 0, 0.4)}.modal-title{color:#000;margin-bottom:3px}.klv__product-info{display:flex;gap:18px;align-items:center;}.klv__image{padding-top:135%;position:relative}.klv__image-wrapper{flex:0 0 100px}.klv__image img{width:100%;height:100%;position:absolute;top:0;left:0;object-fit:cover}.klv__info{flex:1}.klv__title{font-size:16px;margin-bottom:4px;font-weight:bold}.klv__product{font-size:13px;margin-bottom:7px}.klv__variant{font-size:13px;font-style:italic;color:#636363}#email{border:1px solid #000}#variants{display:none}.submit-container{margin-top:10px}#container{margin:0;border-radius:0px;padding:20px 30px}p:empty{display:none}#klaviyo-bis-modal{max-width:90vw;position:absolute;width:400px;top:50%;left:50%;transform:translate(-50%,-50%);width:}#completed_message{font-size:14px;padding:0;margin:0}",
                    drop_background_color: "#000",
                    background_color: "#ffffff",
                    text_color: "#000",
                    button_text_color: "#fff",
                    button_background_color: "#000",
                    close_button_color: "#000",
                    error_background_color: "#ffffff",
                    error_text_color: "#C72E2F",
                    success_background_color: "#ffffff",
                    success_text_color: "#1B9500"
                }
            });
        }
    }
}