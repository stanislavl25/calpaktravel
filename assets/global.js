"use strict";

const color_groups = {
    'beige': ['beige', 'nude', 'linen', 'speckle', 'dune', 'sand-tide', 'gingham', 'oatmeal', 'cappuccino-tie-dye', 'polka-dot', 'sand-tie-dye', 'sand-tie-dye-wash', 'trnk-almond', 'trnk-nude', 'cream', 'gold-marble', 'sand', 'stone', 'terrazzo', 'bronze', 'kaya-bronze', 'birch'],
    'black': ['black', 'trnk-black', 'matte-black', 'ambeur-black', 'luka-black', 'brushed-black', 'wavy', 'eclipse', 'cheetah', 'plaid', 'obsidian', 'onyx', 'midnight-marble'],
    'blue': ['astrology', 'aqua', 'lagoon', 'hydrangea', 'marine', 'winter-sky', 'cloud', 'mist', 'arctic', 'periwinkle', 'cobalt', 'atlantic', 'glacier', 'things-between', 'sky-tie-dye', 'sky-tie-dye-wash', 'denim', 'navy', 'deep-sea', 'sky', 'groovy-blue', 'wild-n-free', 'wild-free', 'wild-n-free', 'fly-girl', 'palm-leaf', 'stars', 'sunset', 'bermuda', 'bluebell'],
    'brown': ['papaya', 'ginger', 'khaki', 'taupe', 'walnut', 'espresso', 'trnk-espresso', 'sand-tide', 'pumpkin', 'gingham', 'mocha', 'rust', 'cognac', 'eclipse', 'cheetah', 'chocolate', 'hazel', 'sand-tie-dye', 'sand-tie-dye-wash', 'bronze', 'kaya-bronze', 'caramel', 'leopard', 'burgundy', 'toffee'],
    'green': ['pale-green', 'khaki', 'modern-abstract', 'palm', 'green-apple', 'kiwi', 'honeydew', 'pistachio', 'sage', 'jade', 'kale', 'forest', 'celery', 'juniper', 'daisy', 'emerald', 'mint', 'sage', 'hue-olive', 'kaya-olive', 'palm-leaf', 'moss', 'groovy-blue', 'olive', 'green-checkerboard'],
    'grey': ['grey', 'taupe', 'charcoal-grey', 'trnk-grey', 'cool-grey', 'charcoal', 'iron', 'dove-grey', 'slate', 'silver-stardust', 'ash'],
    'lavender': ['lavender', 'orchid', 'amethyst', 'things-between', 'groovy-blue', 'bloom', 'orchid-fields'],
    'metallic': ['bronze', 'kaya-bronze', 'gold', 'silver', 'rose-gold'],
    'orange': ['orange', 'papaya', 'orange-grid', 'retro-sunset', 'pumpkin', 'canyon'],
    'pink': ['pink', 'watermelon', 'modern-abstract', 'dragonfruit', 'pink-sand', 'rose', 'retro-sunset', 'pink-gold', 'pink-n-gold', 'canyon', 'guava', 'petal', 'rosewood-tie-dye', 'cappuccino-tie-dye', 'things-between', 'bloom', 'rose-quartz', 'rosewood', 'bubblegum', 'blush', 'blush-pink', 'bon-voyage', 'terracotta', 'aurora-pink', 'confetti', 'floral', 'rose-gold', 'shimmer-pink', 'stripe', 'sunset', 'mauve', 'sorbet', 'jen-pink', 'shell-pink', 'pink-grid'],
    'print': ['astrology', 'trnk-almond', 'trnk-espresso', 'wavy', 'sand-tide', 'daisy', 'cloud', 'gingham', 'rosewood-tie-dye', 'cappuccino-tie-dye', 'flora', 'polka-dot', 'cheetah', 'things-between', 'plaid', 'bloom', 'confetti', 'sand-tie-dye', 'sand-tie-dye-wash', 'sky-tie-dye', 'sky-tie-dye-wash', 'floral', 'gold-marble', 'retro-sunset', 'leopard', 'groovy-blue', 'midnight-marble', 'milk-marble', 'palm-leaf', 'stars', 'stripe', 'sunset', 'terrazzo','mustard-bandana', 'white-bandana', 'tutti-fruity', 'orchid-fields', 'green-checkerboard', 'pink-grid'],
    'red': ['red', 'brick', 'watermelon', 'terracotta', 'rose', 'merlot', 'rosewood', 'retro-sunset', 'poppy', 'burgundy', 'sedona', 'maroon', 'pink-grid'],
    'rose-gold': ['rose-gold', 'rosewood-tie-dye', 'jen-pink'],
    'white': ['white', 'linen', 'dove-grey', 'bloom', 'sky-tie-dye', 'sky-tie-dye-wash', 'white-bandana', 'confetti', 'cream', 'gold-marble', 'milk-marble', 'terrazzo', 'stone'],
    'yellow': ['celery', 'mustard-bandana', 'honey', 'gold', 'stripe', 'sunset', 'pear', 'lemonade', 'dijon', 'yellow']
};

const colors_img = ["trnk-grey", 'modern-abstract', 'speckle', 'orange-grid', "trnk-black", "trnk-espresso", "trnk-nude", "shimmer-pink", "pink-n-gold", "pink-gold", "sorbet", "bronze", "kaya-bronze", "gold", "silver", "rose-gold", "astrology", "trnk-almond", "wavy", "sand-tide", "daisy", "cloud", "gingham", "rosewood-tie-dye", "cappuccino-tie-dye", "flora", "polka-dot", "cheetah", "things-between", "plaid", "bloom", "confetti", "sand-tie-dye", "sand-tie-dye-wash", "sky-tie-dye", "sky-tie-dye-wash", "floral", "gold-marble", "leopard", "midnight-marble", "milk-marble", "palm-leaf", "stars", "stripe", "sunset", "terrazzo", "mustard-bandana", "white-bandana", "tutti-fruity", "retro-sunset", "groovy-blue", "pink-grid", "green-checkerboard", "orchid-fields"];

function isSafari() {
    // return true;
    return navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") === -1
}

function getColorGroup(color) {
    for(let grp in color_groups) {
        for(let i = 0; i < color_groups[grp].length; i++) {
            if(color_groups[grp][i] == color) return {
                group: grp,
                colors: color_groups[grp]
            };
        }
    }

    return {
        group: 'black',
        colors: []
    }
}

function isset(i) {
    return i != null && i != undefined;
}

function quoteattr(s) {
    return ('' + s)
        .replace(/&/g, '&amp;')
        .replace(/'/g, '&apos;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function getIndex(el) {
    let i = 0;
    while((el = el.previousElementSibling) != null) ++i;
    return i;
}

function getIndexWithSelector(el, selector) {
    let index = 0,
        matches = el.parentNode.querySelectorAll(selector);
    
    if(matches.length == 0) return false;
    
    for(let i = 0; i < matches.length; i++) {
        if(matches[i] == el) break;
        index++;
    }
    return index;
}

const stripHTML = (text) =>{
    return (new DOMParser()?.parseFromString(text,"text/html"))
    ?.body?.textContent
}

function handleize(str) {
    if(!str) return '';
    return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
}

function unhandleize(str) {
    if(!str) return '';
    return str.replace('-', ' ');
}

function capitalize(str) {
    str = str.toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatPrice(x) {
    x = Number(x);// / 100;
    if(isNaN(x)) return x;
    return '$' + (x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace('.00', ''));
}

function getImage(src, sizes = "", alt = "") {
    return `<img src="${src}" srcset="${lazyloadImageSrcset(src)}" alt="${alt}" sizes="${sizes}">`
}

function lazyloadImageSrcset(src) {
    if(!src) return;
    let widths = [100, 180, 300, 360, 450, 650, 800, 1000, 1200, 1600, 2000];

    src = src.split('?');
    src = src[0].replace(/\.(jpg|png|jpeg|gif)/, '_{width}x.$1');

    let _image_srcset = [];
    for(let i = 0; i < widths.length; i++) {
        _image_srcset.push(src.replace('_{width}x.', '_'+widths[i]+'x.')+' '+widths[i]+'w');
    }

    return _image_srcset;
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
    
        s.setAttribute('src', src);
        s.addEventListener('load', resolve);
        s.addEventListener('error', reject);
    
        document.body.appendChild(s);
    });
}

function loadStyle(src) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('link');

        s.setAttribute('href', src);
        s.setAttribute('rel', 'stylesheet');
        s.setAttribute('type', 'text/css');
        s.addEventListener('load', resolve);
        s.addEventListener('error', reject);
    
        document.body.appendChild(s);
    });
}

///////////////////////// TABS ///////////////////////////

const tabButtons = document.querySelectorAll('.tabs__button');
for(let i = 0; i < tabButtons.length; i++) tabButtons[i].addEventListener('click', (e) => {
    e.preventDefault();
    const nav = e.target.closest('.tabs__nav');
    const index = e.target.getAttribute('data-index');
    const tabsContainer = nav.nextElementSibling;

    const activeButtons = nav.querySelectorAll('.tabs__button--active');
    activeButtons.forEach(active => active.classList.remove('tabs__button--active'));

    e.target.classList.add('tabs__button--active');


    const activeContent = tabsContainer.querySelectorAll('.tabs__content--active');
    activeContent.forEach(active => active.classList.remove('tabs__content--active'));

    const tab = tabsContainer.querySelector(`.tabs__content[data-index="${index}"]`);
    if(tab) tab.classList.add('tabs__content--active');

    keepTryingUpdateProcessTheProductUnits();
    console.log('waiting for swatches to load')
    setTimeout(() => {
        console.log('wait for swatches to loead is over trying again')
        tryUpdateProcessTheProductUnits();
    }, 3000);
});

/////////////////////// END TABS /////////////////////////

const stickyClose = document.querySelectorAll('.sticky-promo__close');
stickyClose.forEach(close => close.addEventListener('click', (e) => e.target.closest('.sticky-promo').style.display = "none"));

/////////////////////// PRODUCT UNITS /////////////////////////

function setProductData(product, meta, target, current_variant_id = false, init1 = false) {
    const isProductUnit = target.classList.contains('product-unit');

    const handle = product.handle;
    let tags = product.tags;
    if(typeof tags == 'string') tags = tags.split(', ');
    let colorIndex = false;
    let sizeIndex = false;
    let groups = [], hide = [];
    let finalSale = [];
    let collection = false,
        collectionLimit = false,
        earlyAccess = false;
    if(isProductUnit) collection = target.getAttribute('data-collection');

    if(target.hasAttribute('data-early-access')) earlyAccess = target.getAttribute('data-early-access');
    const hasSizeSelector = target.querySelector('.product-unit__sizes') ? true: false;

    tags.forEach(tag => {
        let tg = handleize(tag);
        if(tag.indexOf('group1:') > -1) {
            groups[0] = tag.replace('group1:', '').split(':');
            if(groups[0].length > 1) groups[0][1] = groups[0][1].split(';');
        } else if(tag.indexOf('group2:') > -1) {
            groups[1] = tag.replace('group2:', '').split(':');
            if(groups[1].length > 1) groups[1][1] = groups[1][1].split(';');
        } else if(tag.indexOf('hide:') === 0) {
            let _hide = tag.replace('hide:', '').split(';');
            hide.push(..._hide);
        } else if(tag.indexOf('early-access:') === 0) {
            let _hide = tag.replace('early-access:', '').split(';');
            hide.push(..._hide);
        } else if(finalSale !== true && tg.indexOf('final-sale') === 0) {
            if(tg == 'final-sale') finalSale = true;
            else {
                let finalSaleSplit = tag.split(':');
                if(finalSaleSplit.length > 1) {
                    let values = finalSaleSplit[1].split(';');
                    if(values.length > 0) values.forEach(value => finalSale.push(handleize(value)));
                }
            }
        } else if(collection && tag.indexOf(`${collection}:`) === 0) {
            collectionLimit = tag.replace(`${collection}:`, '').split(';');
        }
    });

    for(let i = 0; i < product.options.length; i++) {
        let optionName = product.options[i];
        if(product.options[i].name !== undefined) optionName = optionName.name;
        if( optionName.toLowerCase().trim() == 'color' ) colorIndex = i;
        if( optionName.toLowerCase().trim() == 'size' ) sizeIndex = i;
    }

    let colors = {
        _count: 0
    };

    let sizes = {
        _count: 0
    };

    let options = '';
    let maxPrice = false,
        minPrice = false,
        current_variant = false;

    let variantAutoSelected;
    if(current_variant_id === false) variantAutoSelected = true;
    else variantAutoSelected = false;

    let availableVariants = [];
    let hideUnavailable = target.classList.contains('product-unit--only-available');

    for(let i = 0; i < product.variants.length; i++) {
        if(hideUnavailable && !product.variants[i].available) continue;
        const opt1 = handleize(product.variants[i].option1);
        if((collectionLimit !== false && collectionLimit.indexOf(opt1) === -1) || (hide !== false && hide.indexOf(opt1) > -1)) continue;
        
        availableVariants.push(product.variants[i]);
    }
    
    if(isProductUnit && isset(init1) && init1 !== false) {
        init1 = handleize(init1);

        let match = false,
            backupMatch = false,
            onlyAvailable = true;

        let colorGroup = getColorGroup(init1);

        for(let i = 0; i < availableVariants.length; i++) {
            const optionColor = handleize(availableVariants[i].option1);

            if(init1 === optionColor) {
                if(!onlyAvailable || availableVariants[i].available) {
                    match = availableVariants[i];
                    break;
                } else {
                    backupMatch = availableVariants[i];
                }
            } else if(match === false && availableVariants[i].available && colorGroup.colors.indexOf(optionColor) > -1) match = availableVariants[i];
        }

        current_variant = match || backupMatch;
        variantAutoSelected = false;

        const handle = target.getAttribute('data-handle');
        const productLinks = target.querySelectorAll('.product-link, .quick-view__link');
        productLinks.forEach(productLink => {
            productLink.setAttribute('href', `/products/${handle}/${handleize(current_variant.option1)}`);
        });
    }

    if(current_variant === false) for(let i = 0; i < availableVariants.length; i++) {
        if(current_variant_id === false) {
            current_variant = availableVariants[i];
            break;
        } else if(current_variant_id == availableVariants[i].id || current_variant_id == handleize(availableVariants[i].option1)) {
            current_variant = availableVariants[i];
            break;
        }
    }
    if(current_variant === false) current_variant = availableVariants[0];

    let hasMultipleSizes = false;
    availableVariants.forEach(variant => {
        const opt1 = handleize(variant.option1);
        let opt2 = false;

        if(variant.option2 != null && variant.option2 != undefined) opt2 = handleize(variant.option2);
        
        // if(opt2 !== false && hasMultipleSizes !== true) {
        //     if(hasMultipleSizes === false) hasMultipleSizes = opt2;
        //     else if(hasMultipleSizes !== opt2) hasMultipleSizes = true;
        // }

        let colorOption = false;
        if(colorIndex === 0) colorOption = opt1;
        else if(colorIndex === 1 && opt2 != false) colorOption = opt2;

        let selected = current_variant.id == variant.id
        let available = variant.available;

        if(colorOption !== false) {

            if(colorOption in colors) {
                if(colors[colorOption].available === false && available === true) colors[colorOption].available = true;
                if(colors[colorOption].selected === false && selected === true) colors[colorOption].selected = true;
            } else {
                let urlOpt1 = `${shopUrl}/products/${handle}/${colorOption}`;
                let url;
                if(opt2 != false) url = `${shopUrl}/products/${handle}/${colorOption},${handleize(current_variant.option2)}`;
                else url = urlOpt1;
                
            
                if(available === false) {
                    setTimeout(
                        () => {
                            target.querySelector(`.product-unit__colors--quickadd .product-unit__colors .product-unit__swatches-container .swatches-container .color-swatch[data-value="${colorOption}"]`).classList.add('product-option--na');
                        }, 1000
                    )
                }

                colors[colorOption] = {
                    available: available,
                    selected: selected,
                    title: variant.option1,
                    first_variant_id: variant.id,
                    urlOpt1: urlOpt1,
                    url: url
                };

                colors._count++
            }
        }

        if (hasSizeSelector) {
            let sizeOption = false;
            if(sizeIndex === 0) sizeOption = opt1;
            else if(sizeIndex === 1 && opt2 != false) sizeOption = opt2;

            if(sizeOption !== false) {

                if(sizeOption in sizes) {
                    if(sizes[sizeOption].available === false && available === true) sizes[sizeOption].available = true;
                    if(sizes[sizeOption].selected === false && selected === true) sizes[sizeOption].selected = true;
                } else {
                    
                    sizes[sizeOption] = {
                        available: available,
                        selected: selected,
                        title: variant.option2,
                        first_variant_id: variant.id,
                        first_variant_price: variant.price
                    };
                    sizes._count++
                }
            }
        }

        let variantPrice = variant.price;
        let variantComparePrice = false;
        if(variant.compare_at_price && variant.compare_at_price > variant.price) variantComparePrice = variant.compare_at_price;

        if(isProductUnit) {
            if(maxPrice === false || variantPrice > maxPrice) maxPrice = variantPrice;
            if(minPrice === false || variantPrice < minPrice) minPrice = variantPrice;
        }

        let preorder = false;
        let hover = false;
        let videoInfo = false;
        if(meta) {
            if(meta.variants[variant.id].preorder) preorder = meta.variants[variant.id].preorder;
            else if(meta.preorder) preorder = meta.preorder;

            if(meta.variants[variant.id].videoInfo) videoInfo = meta.variants[variant.id].videoInfo;
            else if(meta.videoInfo) videoInfo = meta.videoInfo;

            if(isProductUnit && meta.variants[variant.id].hover) hover = meta.variants[variant.id].hover;
        }

        let img = false;
        let created = false;
        if(variant.featured_image) {
            img = variant.featured_image.src;
            created = Math.floor(new Date(variant.featured_image.created_at).getTime() / 1000);
        }

        if(isProductUnit && selected && img){
            target.querySelector('.product-unit__image img').setAttribute('srcset', lazyloadImageSrcset(img));

            if(hover) {
                let hoverImg = document.createElement('img');
                hoverImg.setAttribute('src', hover);
                hoverImg.setAttribute('srcset', lazyloadImageSrcset(hover));
                hoverImg.setAttribute('sizes', target.querySelector('.product-unit__image img').getAttribute('sizes'));
                hoverImg.classList.add('img-hover');
                target.querySelector('.product-unit__image').appendChild(hoverImg);
            }
        }

        options += `<option
                ${selected?'selected="selected"':''}
                ${img?`data-image="${img}"`:''}
                data-option1="${opt1}"
                data-option2="${opt2}"
                ${created?`data-created="${created}"`:''}
                data-sku="${handleize(variant.sku)}"
                ${hover?`data-hover="${hover}"`:''}
                ${videoInfo?`data-video-info="${quoteattr(videoInfo)}"`:''}
                ${preorder?`data-preorder="${quoteattr(preorder)}"`:''}
                ${(finalSale === true || finalSale.indexOf(opt1) > -1)?'data-final-sale':''}
                data-qty="${(variant.inventory_policy == 'deny' && variant.inventory_quantity <= 10)?variant.inventory_quantity:''}"
                data-available="${available}"
                value="${variant.id}"
                data-price="${variantPrice}"
                ${variantComparePrice?`data-cprice="${variantComparePrice}"`:''}
                >
                    ${variant.title}
            </option>`;
    });
    if(hasMultipleSizes !== true) hasMultipleSizes = false;

    let select = document.createElement('select');
    select.classList.add('variant-select');
    select.classList.add('hide');
    select.setAttribute('name', 'id');
    select.innerHTML = options;
    let defaultVariant = target.querySelector('.variant_data');
    if(defaultVariant) {
        defaultVariant.innerHTML = '';
        defaultVariant.appendChild(select);
    } else target.appendChild(select);

    const wishlistButtons = target.querySelectorAll('.wishlist__button');
    if(wishlistButtons.length > 0 && wishlist && current_variant) wishlistButtons.forEach(wishlistButton => checkWishlistButton(wishlistButton, current_variant.id));
    
    if(isProductUnit) {
        select.setAttribute('data-min-price', minPrice);
        select.setAttribute('data-max-price', maxPrice);
        let date = new Date(product.created_at);
        select.setAttribute('data-created', Math.floor(date.getTime() / 1000));

        for(let i = 0; i < product.options.length; i++) {
            if(product.options[i].toLowerCase().trim() == 'color') continue;

            let optionInput = document.createElement('input');
            optionInput.setAttribute("type", "hidden");
            optionInput.setAttribute("data-position", i + 1);
            optionInput.classList.add('product-unit__option');
            optionInput.value = handleize(current_variant[`option${i + 1}`]);
    
            target.appendChild(optionInput);
        }
    }

    if(colors._count === 0) return;

    if(!isProductUnit) {
        let swatchesCheck = [], swatchesElements = [];
        product.variants.forEach(variant => {
            if(swatchesCheck.indexOf(variant.option1) === -1) {
                swatchesCheck.push(variant.option1);
                const varHandle = handleize(variant.option1);
    
                if(hide.indexOf(varHandle) === -1) {
                    let pushGroupIndex = 0;
                    if(
                        groups.length > 0 && groups[0].length > 1 && 
                        (groups[0][1].length === 0 || groups[0][1].indexOf(varHandle) === -1) && 
                        (groups[0][1].length > 0 || groups[1] === false || groups[1][1].indexOf(varHandle) > -1)
                    ) {
                        pushGroupIndex = 1;
                    }
    
                    if(swatchesElements[pushGroupIndex] === undefined) swatchesElements[pushGroupIndex] = [];

                    let img = '';
                    if(colors_img.indexOf(varHandle) > -1) img = `<img src='${filesUrl.replace('file.svg', `${varHandle}.png`)}'>`;
                    swatchesElements[pushGroupIndex] += `<a
                        href="${shopUrl}/products/${product.handle}/${varHandle}"
                        data-value="${varHandle}"
                        title="${capitalize(variant.option1)}"
                        class="color-swatch color-${varHandle}${colors[varHandle].available?'':' product-option--na'}">
                            ` + img + `
                        </a>`;
                }
            }
        });

        const swatchesGroupsEl = target.querySelector('.pdp__swatches-groups');
        if(!swatchesGroupsEl) return;
    
        for(let i = 0; i < swatchesElements.length; i++) {
            swatchesGroupsEl.innerHTML += `<div class="pdp__swatches-group">
                ${groups.length > 0?`<label>${groups[i][0]}</label>`:''}
                <div class="pdp__swatches">${swatchesElements[i]}</div>
            </div>`;
        }

        const activeSwatch = swatchesGroupsEl.querySelector(`.color-swatch[data-value="${handleize(current_variant.option1)}"]`);
        if(activeSwatch) activeSwatch.classList.add('color-swatch--active');
        return;
    }


    target.querySelector('.product-unit__colors-text i').innerHTML = colors._count;
    target.querySelector('.product-unit__colors').setAttribute('data-count', colors._count);

    const swatches = target.querySelector('.product-unit__swatches');
    const colorsContainer = swatches.closest('.product-unit__colors');
    const allColors = colorsContainer.classList.contains('product-unit__colors--all');

    let currentColor = false;
    for (const color in colors) {
        if(color == '_count') continue;

        let el = document.createElement('a');
        
        if(hasMultipleSizes) el.setAttribute('href', colors[color].url);
        else el.setAttribute('href', colors[color].urlOpt1);

        el.classList.add('color-swatch');
        if(allColors) el.classList.add('slide');
        el.classList.add('color-' + color);
        el.setAttribute('title', colors[color].title);
        el.setAttribute('data-value', color);
        el.setAttribute('data-first-variant-id', colors[color].first_variant_id);

        if(colors[color].available === false) el.classList.add('product-option--na');

        if(colors[color].selected === true) {
            el.classList.add('color-swatch--active');
            currentColor = colors[color].title;
            if(!variantAutoSelected) el.classList.add('color-swatch--first');          
        }
        let match = 0;
        const productTags = product.tags;
                for (let i = 0; i < productTags.length; i++) {
                    const collectionUrl = window.location.href;
                        const collectionUrlSplit = collectionUrl.replace('https://www.calpaktravel.com/collections/', '');
                        const tagBuilder = 'first:' + collectionUrlSplit + ':' ;
                        const tagColors = productTags[i].replace(tagBuilder, '');
                        const tagColorsSplit = tagColors.split(';');
                    if (productTags[i].indexOf(tagBuilder) > -1) {
                        for (let i = 0; i < tagColorsSplit.length; i++){
                            if(color == tagColorsSplit[i]){
                                console.log(product.title);
                                el.classList.add('color_index__' + match.toString());
                            }
                            match++;
                        }

                    }
                }

        if(colors[color].available === false && colors[color].selected === true) {
            target.classList.add('product-unit--na');
            
        }

        if(colors_img.indexOf(color) > -1) {
            el.innerHTML = `<img src='${filesUrl.replace('file.svg', `${color}.png`)}'>`;
        }

        swatches.appendChild(el);
    }

    // If sizes wrapper

    if (hasSizeSelector) {

        let currentSize = false;
        const selects = target.querySelector('.product-unit__sizes');
        const sizesContainer = selects.querySelector('.sizes-container');
        const component = target.querySelector('.product-unit__select--seleted');    
        const atcBtn = target.querySelector('.product-unit__button');
        
        for (const size in sizes) {
            if(size == '_count') continue;
    
            let el = document.createElement('a');
            el.setAttribute('href', '#');
            el.classList.add('size-swatch');
            el.classList.add('size-' + size);
            el.setAttribute('title', sizes[size].title);
            el.setAttribute('data-title', size);
            el.value = size;
            el.setAttribute('data-first-variant-id', sizes[size].first_variant_id);

            if (target.querySelector('.product-unit__select--seleted').innerHTML.trim() == '') {
                el.classList.add('selected');
                target.querySelector('.product-unit__select--seleted').innerHTML = `<span>${sizes[size].title}</span> <span>$${sizes[size].first_variant_price / 100}</span>`;
            }
            
            if(sizes[size].available === false) el.classList.add('product-option--na');
    
            if(sizes[size].selected === true) {
                el.classList.add('size-swatch--active');
                currentSize = sizes[size].title;
                if(!variantAutoSelected) el.classList.add('size-swatch--first');
            }
    
            if(sizes[size].available === false && sizes[size].selected === true) target.classList.add('product-unit--na');

            el.innerHTML = `<span>${sizes[size].title}</span> <span>$${sizes[size].first_variant_price / 100}</span>`;

            sizesContainer.appendChild(el);
            
        }
        atcBtn.querySelector('.button--add-to-cart').style.pointerEvents = 'none';
         target.addEventListener('mouseover', (e) => {
            component.classList.add('hovered');
        });
        target.addEventListener('mouseout', (e) => {
            if(!component.classList.contains('focused')){
                component.classList.remove('hovered');
            }
        });
        component.addEventListener('click', (e) => {
            component.classList.toggle('focused');
        });
        atcBtn.addEventListener('click', (e) => {
            component.classList.add('focused');
            atcBtn.querySelector('.button--add-to-cart').style.pointerEvents = 'auto';
            atcBtn.classList.add('ready');
        });
        
        const sizeSwatches = target.querySelectorAll('.size-swatch');
        sizeSwatches.forEach(sizeSwatch => sizeSwatch.addEventListener('click', (e) => {
            component.classList.remove('focused');
        }));

        if (sizes._count <= 1) {
            selects.parentNode.classList.add('hide')
        }
        
    }  

    if(isProductUnit && currentColor) {
        let colorValue = document.createElement('div');
        colorValue.classList.add('color-swatch__value');
        colorValue.innerHTML = currentColor.toLowerCase();

        swatches.appendChild(colorValue);
    }

    if(allColors) {
        swatches.classList.add('slider');
        const sliderWrapper = swatches.parentNode;
        sliderWrapper.setAttribute('data-slide', 4);
        sliderWrapper.setAttribute('data-slide-mob', 3);
        sliderWrapper.innerHTML += `<button class="round-icon slider__control slider__control--prev round-icon--prev" title="Previous"></button><button class="round-icon slider__control slider__control--next round-icon--next" title="Next"></button>`;
        sliderWrapper.classList.add('slider__wrapper', 'slider__wrapper--start');

        checkSlider(sliderWrapper.querySelector('.slider'));
    }

    if( !allColors ) {
        if(colors._count == settings.swatchesLimit + 1) {
            const swatchesContainer = target.querySelector('.product-unit__swatches-container');

            swatchesContainer.style.setProperty('--product-unit-sw-limit', settings.swatchesLimit + 1);
        } else if ( colors._count > settings.swatchesLimit + 1 ) {
            const swatchesContainer = target.querySelector('.product-unit__swatches-container');

            let extra_colors = document.createElement('a');
            extra_colors.classList.add('extra-colors');
            extra_colors.setAttribute('href', `${shopUrl}/products/${handle}`);
            extra_colors.innerHTML = '+' + (colors._count - settings.swatchesLimit);

            swatchesContainer.appendChild(extra_colors);
        }
    }
}

function activateProductUnit(target) {
    if(target.classList.contains('product-unit--loaded')) return;
    const handle = target.getAttribute('data-handle');
    
    if(window.debug) console.log('Init product', handle);
    
    return new Promise((resolve, reject) => {
        fetch('/products/' + handle + '?view=json')
        .then(response => response.json())
        .then(data => {
            setProductData(data.product, data.metafields, target, target.getAttribute('data-variant'), target.getAttribute('data-init-1'));
            [...target.querySelectorAll('.splash')].map(splash => splash.classList.remove('splash'))
            target.classList.add('product-unit--loaded');
            if(window.debug) console.log('Done product', handle);
            resolve(true);
        });
    })
}

function closeAllDropdowns() {
    const openDropdowns = document.querySelectorAll('.site-header__dropdown--active');
    if(openDropdowns.length > 0) openDropdowns.forEach(openDropdown => openDropdown.classList.remove('site-header__dropdown--active'));
}

window.addEventListener("click", async (e) => {

    if(e.target.classList.contains('size-swatch')) {
        e.preventDefault();

        if(typeof variantUpdateProcess == 'undefined') {
            await loadScript(scripts.variants);
        }

        const thisSize = e.target.querySelectorAll('span')[0].innerHTML;
        const thisPrice = e.target.querySelectorAll('span')[1].innerHTML;
        const sizesContainer = e.target.parentNode.querySelectorAll('.size-swatch');
        const variantSelector = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.variant-select');
        const selectedContainer = e.target.parentNode.parentNode.parentNode.querySelector('label');
        const componentContainer = e.target.parentNode.parentNode.parentNode.querySelector('input[type="checkbox"]');
        const colorContainer = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('.product-unit__colors');
        const colorTarget = colorContainer.querySelector('.product-unit__colors .color-swatch--active');
        componentContainer.checked = false;
        selectedContainer.innerHTML = `<span>${thisSize}</span> <span>${thisPrice}</span>`;
        sizesContainer.forEach(element => element.classList.remove('selected'));
        e.target.classList.add('selected');
        variantUpdateProcess(colorTarget);
        colorContainer.querySelectorAll('.color-swatch').forEach( color => {    
            const option = variantSelector.querySelector(`[data-option1="${color.dataset.value}"][data-option2="${e.target.dataset.title}"]`);
            option.dataset.available == 'true' 
                ? color.classList.remove('product-option--na')
                : color.classList.add('product-option--na');
        });
    }

    if(e.target.classList.contains('color-swatch')) {
        e.preventDefault();
        if(typeof variantUpdateProcess == 'undefined') {
            await loadScript(scripts.variants);
        }

        const actives = e.target.closest('.swatches-container').querySelectorAll('.color-swatch--active');
        actives.forEach( active => active.classList.remove('color-swatch--active') );
        e.target.classList.add('color-swatch--active');

        variantUpdateProcess(e.target);
    } else if(e.target.classList.contains('product-option')) {
        e.preventDefault();
        if(typeof variantUpdateProcess == 'undefined') {
            await loadScript(scripts.variants);
        }

        const actives = e.target.closest('.pdp__variant-buttons').querySelectorAll('.product-option--selected');
        actives.forEach( active => active.classList.remove('product-option--selected') );
        e.target.classList.add('product-option--selected');

        variantUpdateProcess(e.target);
    } else if(e.target.classList.contains('button--add-to-cart')) {
        e.preventDefault();
        let variant_id = false;
        let mod = {
            final: false,
            preorder: false
        };

        let prnt = e.target.closest('.product-unit');
        if(prnt) {
            prnt.classList.add('adding-to-cart');
            const select = prnt.querySelector('.variant-select');
            variant_id = select.value;
            mod.final = select.options[select.selectedIndex].hasAttribute('data-final-sale');
            mod.preorder = select.options[select.selectedIndex].getAttribute('data-preorder');
        } else {
            variant_id = e.target.getAttribute('data-id');
            mod.final = e.target.hasAttribute('data-final');
            mod.preorder = e.target.getAttribute('data-preorder');
        }

        if(!variant_id) return;

        if(typeof openCart == 'undefined') await activateCart();

        addToCart(variant_id, 1, (data) => {
            updateCart(data);
            console.log("SE ABRE");
            openCart();

            if(prnt && prnt.classList.contains('adding-to-cart')) {
                prnt.classList.add('added-to-cart');

                setTimeout(() => {
                    prnt.classList.remove('added-to-cart');
                }, 3000);
            }
        }, () => {
            if(prnt) prnt.classList.remove('adding-to-cart');
        }, mod.final, mod.preorder);
    }

    closeAllDropdowns();

    const openNotifications = document.querySelector('.notifications-popup--active');
    if(openNotifications) openNotifications.classList.remove('notifications-popup--active');
});

function activateVideoContainer(video) {
    const url = video.getAttribute('data-video');

    if(!video.classList.contains('video-iframe-container--loaded')) {

        if(!video.classList.contains('video-iframe-container--contain')) {
            const vimeoId = video.getAttribute('data-vimeo-id');
    
            fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${vimeoId}`)}`, {
                method: 'GET',
                cache: 'no-cache', 
                mode: 'cors'
            })
            .then(response => response.json())
            .then(response => {
                video.style.setProperty('--ratio', `${response.width} / ${response.height}`)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }

        video.innerHTML = `<iframe allow="autoplay; fullscreen" allowfullscreen="" width="100%" height="100%" frameborder="0" src="${url}"></iframe>`;
        video.classList.add('video-iframe-container--loaded');
    }
}

async function quickViewClick(e) {
    e.preventDefault();

    try {
        if(typeof getQuickView == 'undefined') {
            await loadScript(scripts.quickview);
            await loadStyle(styles.quickview);
        }
    } catch (e) {
        console.log(e);
    }

    let variant = false;
    const productUnit = this.closest('.product-unit');
    if(productUnit) {
        let variantSelect = productUnit.querySelector('.variant-select');
        if(variantSelect) variant = variantSelect.value;
    }

    getQuickView(this.getAttribute('href'), variant);
}

let productUnitsObserver = false;
let videoObserver = false;
window.addEventListener("load", () => {
    productUnitsObserver = new IntersectionObserver(function(entries){
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                activateProductUnit(entry.target);
                productUnitsObserver.unobserve(entry.target);
            }
        });
    }, {threshold: 0.01, rootMargin: '0px'});

    videoObserver = new IntersectionObserver(function(entries){
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                activateVideoContainer(entry.target);
                videoObserver.unobserve(entry.target);
            }
        });
    }, {threshold: 0, rootMargin: '0px'});

    
    const productUnits = document.querySelectorAll(".product-unit");
    productUnits.forEach( productUnit => productUnitsObserver.observe(productUnit) );
    
    const videos = document.querySelectorAll(".video-iframe-container");
    videos.forEach( video => videoObserver.observe(video) );

    let quickViewLinks = document.querySelectorAll('.quick-view__link');
    [...quickViewLinks].map( function(quickViewLink) {
        quickViewLink.addEventListener('click', quickViewClick);
    });

    const subcategoryActivators = document.querySelectorAll('.filter__collections .filter__collection');
    [...subcategoryActivators].map( function(subcategoryActivator) {
        subcategoryActivator.addEventListener('click', function(e) {
            setTimeout(() => {
                let quickViewLinksDynamic = document.querySelectorAll('.quick-view__link');
                [...quickViewLinksDynamic].map( function(quickViewLink) {
                    quickViewLink.addEventListener('click', quickViewClick);
                });
            }, 3000);
        });
    });

    const footerLinks = document.querySelectorAll('.footer__widget-title');
    footerLinks.forEach(footerLink => footerLink.addEventListener('click', e => e.target.classList.toggle('footer__widget-title--active')));
});


///////////////////////// CART ///////////////////////////

const bagLink = document.querySelector('.open-cart-link');
if(bagLink) bagLink.addEventListener('click', async function(e){
    e.preventDefault();
    if(typeof openCart == 'undefined') await activateCart();
    console.log("SE ABRE 2");
    openCart();
});

function activateCart() {
    let promises = [];
    promises.push(loadScript(scripts.cart));
    promises.push(loadStyle(styles.cart));

    return Promise.all(promises);
}

///////////////////////// TIMERS ///////////////////////////
function updateTimeouts(countdown_ticks) {
    for(let i = 0; i < countdown_ticks.length; i++) {
        let time_left = countdown_ticks[i].getAttribute('data-time');
        if (!time_left) {
            time_left = countdown_ticks[i].getAttribute('data-time-left');
            time_left--;
            countdown_ticks[i].setAttribute('data-time-left', time_left);
        } else {
            time_left--;
            countdown_ticks[i].setAttribute('data-time', time_left);
        }

        if(time_left < 0) {
            return;
        }

        let d = 0;//Math.floor(time_left / 86400);
        let h = Math.floor(time_left / 3600);
        let m = Math.floor((time_left - h * 3600) / 60);
        let s = time_left % 3600 % 60;

        if(m < 10) m = '0' + m;
        if(s < 10) s = '0' + s;

        let timeLeftHtml = '';
        if(d > 0) {
            h -= 24 * d;
            if(h < 10) h = '0' + h;
            timeLeftHtml = '<span>' + d + 'D</span> : <span>' + h + 'H</span> : <span>' + m + 'M</span>';
        } else {
            if(h < 10) h = '0' + h;
            timeLeftHtml = '<span>' + h + '</span> : <span>' + m + '</span> : <span>' + s + '</span>';
        }

        countdown_ticks[i].innerHTML = timeLeftHtml;
    }
}

window.addEventListener("load", () => {
    let countdown_ticks = document.querySelectorAll('.countdown-timer');

    if(countdown_ticks.length) {
        updateTimeouts(countdown_ticks);
        setInterval(() => updateTimeouts(countdown_ticks), 1000);
    }
});

function hasOtherValues(productContainer, value) {
    const select = productContainer.querySelector('.variant-select');
    if(!select) return false;

    return select.querySelector(`option[data-option2]:not([data-option2="${value}"])`) ? true : false;
}

function getProductOptionsList(productContainer, location = 'pdp') {
    let options = [];
    let multipleSizes = false,
        disableMultiple = true;

    for(let i = 1; i <= 3 ; i++) {
        const optCont = productContainer.querySelector(`.pdp__variants [data-position="${i}"], .product-unit__option[data-position="${i}"], .product-unit__colors[data-position="${i}"]`);
        
        if(optCont) {
            let value = false;
            if(optCont.classList.contains('product-unit__colors')) {
                let selectedOption = optCont.querySelector('.color-swatch--active');
                if(selectedOption) value = selectedOption.getAttribute('data-value');

                if(!disableMultiple && i == 2 && hasOtherValues(productContainer, value)) multipleSizes = true;
            } else if(optCont.classList.contains('product-unit__option')){
                value = optCont.value;
                
                if(!disableMultiple && i == 2 && hasOtherValues(productContainer, value)) multipleSizes = true;
            } else if(optCont.classList.contains('pdp__variant-buttons')) {
                let selectedOption = optCont.querySelector('.product-option--selected');
                if(selectedOption) value = selectedOption.getAttribute('data-value');
                
                if(!disableMultiple && i == 2 && hasOtherValues(productContainer, value)) multipleSizes = true;
            } else if(optCont.classList.contains('pdp__variant-color')) {
                let selectedOption = optCont.querySelector('.color-swatch--active');
                if(selectedOption) value = selectedOption.getAttribute('data-value');
                
                if(!disableMultiple && i == 2 && hasOtherValues(productContainer, value)) multipleSizes = true;

                if(location == 'pdp' && selectedOption) {
                    const selVar = optCont.querySelector('.pdp__selected-variant');
                    if(selVar) selVar.innerHTML = selectedOption.getAttribute('title');
                }
            }

            if(value === false || value === 'false') continue;
            options.push(value);
        }
    }

    return [options, multipleSizes];
}

/* adding id to footer links */
window.addEventListener("load", () => {
    const footerLinks = document.querySelectorAll('.footer__widget .list-menu__item');
    [].map.call(footerLinks, (footerLink) => {
        let idString = footerLink.innerHTML.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '');
        footerLink.setAttribute('id', 'menu-footer-' + idString);
    });
});
/* quickadd code from google optimize - product swatches - product unit */
document.addEventListener('DOMContentLoaded', function () {
    if(document.querySelector('.product-grid')) { // !!!
        //quick add function
        const loadQuickAdd = () => {
            document.querySelectorAll('.product-grid .quick-view__link').forEach(link => link.classList.add('hide'));
            document.querySelector('.product-grid').classList.add('product-grid--gap');
            document.querySelectorAll('.product-grid .product-unit').forEach(product => product.classList.add('product-unit--quickadd'));
            document.querySelectorAll('.product-grid .product-unit__colors').forEach(colors => {
                colors.classList.add('product-unit__colors--all', 'slide');
                colors.parentNode.parentNode.querySelector('.product-unit__colors--quickadd').append(colors)
            });
            document.querySelectorAll('.product-grid .product-unit__button').forEach(product => product.classList.add('product-unit__button--active'));
            document.querySelectorAll('.product-grid .product-unit__swatches').forEach(swatches => {
                swatches.classList.add('slider');
                const sliderWrapper = swatches.parentNode;
                sliderWrapper.setAttribute('data-slide', 4);
                sliderWrapper.setAttribute('data-slide-mob', 3);
                sliderWrapper.innerHTML += `<button class="round-icon slider__control slider__control--prev round-icon--prev" title="Previous"></button><button class="round-icon slider__control slider__control--next round-icon--next" title="Next"></button>`;
                sliderWrapper.classList.add('slider__wrapper', 'slider__wrapper--start');
                
                
                console.log('check slide')
                checkSlider(sliderWrapper.querySelector('.slider'));
            });
        }

        loadQuickAdd();
        document.addEventListener("shopify:section:load", loadQuickAdd);
        document.addEventListener("shopify:section:change", loadQuickAdd);
        document.addEventListener('page:load', loadQuickAdd);
        document.addEventListener('page:change', loadQuickAdd);
        
        const subcategoryLinks = document.querySelectorAll('a.filter__collection');
        [].map.call(subcategoryLinks, (subcategoryLink) => {
            subcategoryLink.addEventListener('click', (e) => {
                setTimeout( function() {
                    loadQuickAdd();
                }, 2000);       
            });
        });
    }



    /**
     * 
     * FOR EVERY MODIFICATION IN HERE MAKE SURE TO UPDATE THE SAME FUNCTIONS ON assets/slider.js
     */
        const processSection = ({selector, differentSwatches}) => {
            const section = document.querySelector(selector);
            if (section) {
                Array.from(section.querySelectorAll('.product-unit')).map((productUnit) => {
                    let firstSwatch = productUnit.querySelector('.product-unit__colors .product-unit__swatches-container .color-swatch--active');
                    if (differentSwatches) {
                        firstSwatch = productUnit.querySelector('.product-unit__colors .product-unit__swatches-container .swatches-container .color-swatch--active');
                    } 
                    if (firstSwatch) {
                        variantUpdateProcess(firstSwatch);
                    }
                });
            }
        };
        
        const initializeSections = () => {
            const sections = [
                { selector: '.shopify-section--pdp-featured', differentSwatches: false },
                { selector: '.pdp__upsell', differentSwatches: false },
                { selector: '.product-grid', differentSwatches: false },
                { selector: '.featured-col__lists', differentSwatches: false },
                { selector: '.shopify-section--featured-collections', differentSwatches: true }
            ];
        
            sections.map(section => processSection(section));
        };
        
        let scriptLoaded = false;
        const tryUpdateProcessTheProductUnits = (intervalId = false) => {
            console.log('Trying updateProcessTheProductUnits');
            try {
                initializeSections();
                if(intervalId && typeof variantUpdateProcess != 'undefined') {
                    console.log('variantUpdateProcess loaded');
                    console.log('clearing interval');
                    clearInterval(intervalId);
                }
            } catch (e) {
                if(typeof variantUpdateProcess == 'undefined') {
                    console.log('variantUpdateProcess not loaded yet');
                    if (!scriptLoaded) {
                        loadScript(scripts.variants);
                        scriptLoaded = true;
                    }
                } else {
                    console.error(e);
                }
            }
        }
        const keepTryingUpdateProcessTheProductUnits = () => {
            let intervalId = setInterval(() => {
                console.log(intervalId)
                tryUpdateProcessTheProductUnits(intervalId);
            }, 1000);
        }

        keepTryingUpdateProcessTheProductUnits()

        let lastScroll = window.pageYOffset;
        window.addEventListener('scroll', () => {
            let scrolled = false
            if (!scrolled) {
                scrolled = true;
                setTimeout(() => { scrolled = false } ,500)
                tryUpdateProcessTheProductUnits();
            }
        });
        document.addEventListener('DOMContentLoaded', e => tryUpdateProcessTheProductUnits());
        document.addEventListener('shopify:section:load', e => tryUpdateProcessTheProductUnits());
        document.addEventListener('shopify:section:change', e => tryUpdateProcessTheProductUnits());
        document.addEventListener('page:load', e => tryUpdateProcessTheProductUnits());
        document.addEventListener('page:change', e => tryUpdateProcessTheProductUnits());
});