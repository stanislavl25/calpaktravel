"use strict";

const featuresTitles = document.querySelectorAll('.pdp-feature__title');
if(featuresTitles.length > 0) featuresTitles.forEach(featuresTitle => featuresTitle.addEventListener('click', (e) => {
    e.preventDefault();

    const target = e.target,
        prnt = target.closest('.pdp-features'),
        feat = target.closest('.pdp-feature'),
        active = feat.parentNode.querySelector('.pdp-feature--active');

    const index = getIndex(feat);

    let activeMedia = prnt.querySelector('.pdp-feature__media--active');
    if(activeMedia) activeMedia.classList.remove('pdp-feature__media--active');

    prnt.querySelectorAll('.pdp-feature__media')[index].classList.add('pdp-feature__media--active');

    if(active) active.classList.remove('pdp-feature--active');
    feat.classList.add('pdp-feature--active');
}));