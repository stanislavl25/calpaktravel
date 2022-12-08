"use strict";

function lazyloadImageSrcset(src) {
    let widths = [180, 360, 540, 720, 900, 1080, 1296, 1512, 1728, 2048];

    src = src.split('?');
    src = src[0].replace(/\.(jpg|png|jpeg|gif)/, '_{width}x.$1');

    let _image_srcset = [];
    for(let i = 0; i < widths.length; i++) {
        _image_srcset.push(src.replace('_{width}x.', '_'+widths[i]+'x.')+' '+widths[i]+'w');
    }

    return _image_srcset;
}

function swatchClickedCallback(swatch) {
    const productUnit = swatch.closest('.product-unit');
    if(productUnit) {
        const actives = productUnit.querySelectorAll('.color-swatch--active');
        const select = productUnit.querySelector('.variant-select');
        if(!select) return;

        actives.forEach( active => active.classList.remove('color-swatch--active') );

        swatch.classList.add('color-swatch--active');

        const opt1 = swatch.getAttribute('data-value');
        const option = select.querySelector(`option[data-option1="${opt1}"]`);
        const img = option.getAttribute('data-image');

        if(img) productUnit.querySelector('.product-unit__image img').setAttribute('srcset', lazyloadImageSrcset(img));
    }
}