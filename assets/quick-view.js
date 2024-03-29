"use strict";

if(window.debug) console.log('quick-view.js loaded');

function getQuickViewProduct(link, variant) {
    return new Promise((resolve) => {
        fetch(link + '?view=quick-view')
        .then(response => response.json())
        .then(data => {
            resolve(data);
        });
    })
}

function setQuickViewContent(data, variant, qvParent) {

    qvParent.querySelector('.qv__body-inner').innerHTML = data.layout;

    const target = qvParent.querySelector('.pdp__variants');
    const product = data.product;

    let meta = false;
    const qvMetaJSON = qvParent.querySelector('.qv-meta-json');
    if(qvMetaJSON) try {
        meta = JSON.parse(qvMetaJSON.innerHTML);
    } catch( e ) { console.log('No QV meta!')}

    setProductData(product, meta, target, variant);

    const productForm = qvParent.querySelector('.shopify-product-form');
    if(productForm) productForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        pdpFormSubmit(productForm, false);
    });

    let countdown_ticks = qvParent.querySelectorAll('.countdown-timer');

    if(countdown_ticks.length) {
        updateTimeouts(countdown_ticks);
        setInterval(() => updateTimeouts(countdown_ticks), 1000);
    }

    const videos = qvParent.querySelectorAll(".video-iframe-container");
    if(videoObserver && videos.length) videos.forEach( video => videoObserver.observe(video) );

    const gallerySlider = qvParent.querySelector('.qv__gallery-inner');
    const galleryThumbsSldier = qvParent.querySelector('.qv__gallery-thumbs-inner');

    let variantSizeEl = qvParent.querySelector('.pdp__variants .pdp__variant-size');
    if(variantSizeEl) selectLoad(true, product.handle)
    

    variantUpdateProcess(target);

    bindWaitlist(qvParent);

    setTimeout(() => {
        checkSlider(galleryThumbsSldier, 1);
        checkSlider(gallerySlider, 1, index => {
            if(index == 0) return 0;
            return index - 1;
        });

        galleryThumbsSldier.addEventListener('click', (e) => {
            if(e.target.classList.contains('slide')) sliderThumbClick(e.target, index => {
                if(index == 0) return 0;
                return index + 1;
            }, 1);
        });
    }, 1);
}

async function getQuickView(link, variant = false) {
    let qvParent = document.querySelector('.quick-view__container');
    if(!qvParent) {
        qvParent = document.createElement('div');
        qvParent.classList.add('quick-view__container');
        
        qvParent.innerHTML = `<div class="qv__overlay"></div>
        <div class="qv__body">
        <button class="close-button qv__close" title="Close"></button>
        <div class="qv__body-inner"></div>
        </div>`;
        
        document.body.appendChild(qvParent);
    }
    qvParent.classList.add('loading-animation', 'quick-view__container--nudge');

    document.body.classList.add('modal-open');

    let promises = [];
    if(typeof variantUpdateProcess == 'undefined') promises.push(loadScript(scripts.variants));
    if(typeof pdpCreateSizeSelect == 'undefined') {
        promises.push(loadScript(scripts.pdp));
        promises.push(loadStyle(styles.pdp));
        promises.push(loadStyle(styles.pdpGallery));
        promises.push(loadStyle(styles.starRating));
        promises.push(loadStyle(styles.waitlist));
        promises.push(loadStyle(styles.tooltip));
    }

    if(promises.length > 0) await Promise.all(promises);

    await getQuickViewProduct(link, variant).then((json) => {
        setQuickViewContent(json, variant, qvParent)
    });

    qvParent.classList.add('quick-view__container--active');
    qvParent.classList.remove('loading-animation', 'quick-view__container--nudge');

    const qvButton = document.querySelectorAll('.qv__body .button--pdp__submit');
    [].map.call(qvButton, (button) => {
        button.classList.add('qv_add-to-cart');
    });
}

window.addEventListener("click", async (e) => {
    if(e.target.classList.contains('qv__overlay') || e.target.classList.contains('qv__close')) {
        e.preventDefault();
        document.body.classList.remove('modal-open');
        document.querySelector('.quick-view__container').classList.remove('quick-view__container--active');
        setTimeout(() => {
            document.querySelector('.quick-view__container').remove();
        }, 305)
    }
});

/* Change for git */