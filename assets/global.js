"use strict";

const color_groups = {
    'beige': ['beige', 'nude', 'linen', 'dune', 'sand-tide', 'gingham', 'oatmeal', 'cappuccino-tie-dye', 'polka-dot', 'sand-tie-dye', 'sand-tie-dye-wash', 'trnk-almond', 'trnk-nude', 'cream', 'gold-marble', 'sand', 'stone', 'terrazzo', 'bronze', 'kaya-bronze', 'birch'],
    'black': ['black', 'trnk-black', 'matte-black', 'ambeur-black', 'luka-black', 'brushed-black', 'wavy', 'eclipse', 'cheetah', 'plaid', 'obsidian', 'onyx', 'midnight-marble'],
    'blue': ['astrology', 'cloud', 'mist', 'arctic', 'periwinkle', 'cobalt', 'atlantic', 'glacier', 'sky', 'things-between', 'deep-sea', 'sky-tie-dye', 'sky-tie-dye-wash', 'denim', 'navy', 'groovy-blue', 'wild-n-free', 'wild-free', 'wild-n-free', 'fly-girl', 'palm-leaf', 'stars', 'sunset', 'bermuda', 'bluebell'],
    'brown': ['papaya', 'sand-tide', 'pumpkin', 'gingham', 'espresso', 'mocha', 'rust', 'cognac', 'eclipse', 'cheetah', 'chocolate', 'hazel', 'sand-tie-dye', 'sand-tie-dye-wash', 'bronze', 'kaya-bronze', 'caramel', 'leopard', 'burgundy', 'toffee'],
    'green': ['pale-green', 'honeydew', 'jade', 'kale', 'forest', 'celery', 'juniper', 'daisy', 'emerald', 'mint', 'sage', 'hue-olive', 'kaya-olive', 'palm-leaf', 'moss', 'groovy-blue', 'olive'],
    'grey': ['grey', 'charcoal-grey', 'trnk-grey', 'cool-grey', 'charcoal', 'iron', 'dove-grey', 'slate', 'silver-stardust', 'ash'],
    'lavender': ['lavender', 'orchid', 'things-between', 'groovy-blue', 'bloom'],
    'metallic': ['bronze', 'kaya-bronze', 'gold', 'silver', 'rose-gold'],
    'orange': ['orange', 'papaya', 'retro-sunset', 'pumpkin', 'canyon'],
    'pink': ['pink', 'dragonfruit', 'pink-sand', 'retro-sunset', 'pink-gold', 'pink-n-gold', 'canyon', 'guava', 'petal', 'rosewood-tie-dye', 'cappuccino-tie-dye', 'things-between', 'bloom', 'rose-quartz', 'blush', 'blush-pink', 'bon-voyage', 'terracotta', 'aurora-pink', 'confetti', 'floral', 'rose-gold', 'shimmer-pink', 'stripe', 'sunset', 'mauve', 'sorbet', 'jen-pink', 'shell-pink'],
    'print': ['astrology', 'trnk-almond', 'wavy', 'sand-tide', 'daisy', 'cloud', 'gingham', 'rosewood-tie-dye', 'cappuccino-tie-dye', 'flora', 'polka-dot', 'cheetah', 'things-between', 'plaid', 'bloom', 'confetti', 'sand-tie-dye', 'sand-tie-dye-wash', 'sky-tie-dye', 'sky-tie-dye-wash', 'floral', 'gold-marble', 'retro-sunset', 'leopard', 'groovy-blue', 'midnight-marble', 'milk-marble', 'palm-leaf', 'stars', 'stripe', 'sunset', 'terrazzo','mustard-bandana', 'white-bandana', 'tutti-fruity'],
    'red': ['red', 'brick', 'terracotta', 'merlot', 'retro-sunset', 'poppy', 'burgundy', 'sedona', 'maroon'],
    'rose-gold': ['rose-gold', 'rosewood-tie-dye', 'jen-pink'],
    'white': ['white', 'linen', 'dove-grey', 'bloom', 'sky-tie-dye', 'sky-tie-dye-wash', 'white-bandana', 'confetti', 'cream', 'gold-marble', 'milk-marble', 'terrazzo', 'stone'],
    'yellow': ['celery', 'mustard-bandana', 'honey', 'gold', 'stripe', 'sunset', 'pear', 'lemonade', 'dijon', 'yellow']
};

function handleize(str) {
    if(!str) return '';
    return str.toLowerCase().replace(/[^\w\u00C0-\u024f]+/g, "-").replace(/^-+|-+$/g, "");
}

function formatPrice(x) {
    x = Math.floor(x);// / 100;
    return '$' + (x.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",").replace('.00', ''));
}

let windowScrollThrottle = false;
let windowLastScroll = window.pageYOffset;
let headerStatus = 'visible';
let headerEl = document.querySelector('.shopify-section--header');
window.addEventListener('scroll', function() {
    if(windowScrollThrottle !== false) clearTimeout(windowScrollThrottle);
    windowScrollThrottle = setTimeout(() => {
        if(windowLastScroll < window.pageYOffset && headerStatus == 'visible' && !document.body.classList.contains('modal-open')) headerStatus = 'hidden';
        else if(windowLastScroll > window.pageYOffset && headerStatus == 'hidden') headerStatus = 'visible';

        headerEl.setAttribute('data-status', headerStatus);
        windowLastScroll = window.pageYOffset;
    }, 10);
}, {passive: true});

let searchPlaceholders = document.querySelectorAll('.search-placeholders');
if(searchPlaceholders.length > 0) {
    setInterval(() => {
        for(let i = 0; i < searchPlaceholders.length; i++) {
            const num = parseInt(searchPlaceholders[i].getAttribute('data-num'));
            let page = searchPlaceholders[i].style.getPropertyValue('--page');
            page++;
            searchPlaceholders[i].style.setProperty('--page', page);

            if(page >= num) {
                setTimeout(() => {
                    setTimeout(() => {
                        searchPlaceholders[i].classList.add('search-placeholders--no-anim');
                    }, 20);
    
                    setTimeout(() => {
                        page = 0;
                        searchPlaceholders[i].style.setProperty('--page', page);
                    }, 70);
                    
                    setTimeout(() => {
                        searchPlaceholders[i].classList.remove('search-placeholders--no-anim');
                    }, 120);
                }, 500);
            }
        }
    }, 3000);
}

let searchActivator = document.querySelector('.header__search-link');
searchActivator.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const actives = document.querySelectorAll('.menu-popup--active');
    for(let i = 0; i < actives.length; i++) actives[i].classList.remove('menu-popup--active');
    
    document.querySelector('.menu-popup--search').classList.add('menu-popup--active');
    document.body.classList.add('modal-open');

    document.querySelector('.menu-popup--search .search-input').focus();

    if(headerStatus == 'hidden') {
        headerStatus = 'visible';
        headerEl.setAttribute('data-status', headerStatus);
    }

    try {
        if(typeof performSearch == 'undefined') {
            let src = document.querySelector('.menu-popup--search').getAttribute('data-src');
            await loadScript(src);
        }
        
    } catch (e) {
        console.log(e);
    }
});

let quickViewLinks = document.querySelectorAll('.quick-view__link');
if(quickViewLinks.length > 0) quickViewLinks.forEach(quickViewLink => quickViewLink.addEventListener('click', async function(e) {
    e.preventDefault();

    try {
        if(typeof getQuickView == 'undefined') {
            await loadScript(scripts.quickview);
        }
    } catch (e) {
        console.log(e);
    }
    
    getQuickView();
}));

let menuActivators = document.querySelectorAll('.menu-popup__activator');
for(let i = 0; i < menuActivators.length; i++) menuActivators[i].addEventListener('click', function(e) {
    e.preventDefault();
    const target = this.getAttribute('data-target');
    const menu = document.querySelector('.menu-popup[data-id="' + target + '"]');

    if(!menu) return;

    if(menu.classList.contains('menu-popup--active')) {
        menu.classList.remove('menu-popup--active');
        menu.classList.remove('menu-popup--visible');
        document.body.classList.remove('modal-open');
        return;
    }

    const actives = document.querySelectorAll('.menu-popup--active');
    for(let i = 0; i < actives.length; i++) {
        actives[i].classList.remove('menu-popup--active');
        actives[i].classList.remove('menu-popup--visible');
    }

    document.body.classList.add('modal-open');
    if(headerStatus == 'hidden') {
        headerStatus = 'visible';
        headerEl.setAttribute('data-status', headerStatus);
    }

    menu.classList.add('menu-popup--active');
    setTimeout(() => {
        menu.classList.add('menu-popup--visible');
    }, 5);

    const func = menu.getAttribute('data-func');
    if(func && typeof window[func] === 'undefined') {
        let src = menu.getAttribute('data-src');
        loadScript(src);
    }
});

let menuDeactivators = document.querySelectorAll('.menu-close');
for(let i = 0; i < menuDeactivators.length; i++) menuDeactivators[i].addEventListener('click', function() {
    let menuPopup = this.closest('.menu-popup');
    if(menuPopup) {
        menuPopup.classList.remove('menu-popup--active');
        menuPopup.classList.remove('menu-popup--visible');
    }
    document.body.classList.remove('modal-open');
});

let subnavActivators = document.querySelectorAll('.subnav__activator');
for(let i = 0; i < subnavActivators.length; i++) subnavActivators[i].addEventListener('click', function(e) {
    e.preventDefault();
    this.closest('.subnav__container').classList.toggle('site-header__dropdown--active');
});

let notifiactionsActivator = document.querySelector('.header__notifications-link');
let notifiactionPopup = document.querySelector('.notifications-popup');
if(notifiactionsActivator && notifiactionPopup) {

    notifiactionsActivator.addEventListener('click', function(e) {
        e.preventDefault();
        notifiactionPopup.classList.add('notifications-popup--active');
    });

    notifiactionPopup.querySelector('.menu-close').addEventListener('click', function(e) {
        e.preventDefault();
        notifiactionPopup.classList.remove('notifications-popup--active');
    });
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

/////////////////////// SLIDERS //////////////////////////

let sliderControls = document.querySelectorAll('.slider__control');
for(let i = 0; i < sliderControls.length; i++) sliderControls[i].addEventListener('click', function(e) {
    e.preventDefault();
    let wrapper = this.closest('.slider__wrapper');
    let gap = 0;
    let slideNum = 1;
    if(wrapper.hasAttribute('data-gap')) gap = Number(wrapper.getAttribute('data-gap'));
    if(wrapper.hasAttribute('data-slide')) slideNum = Number(wrapper.getAttribute('data-slide'));
    if(window.innerWidth <= 900 && wrapper.hasAttribute('data-slide-mob')) slideNum = Number(wrapper.getAttribute('data-slide-mob'));
    let slider = wrapper.querySelector('.slider');
    let firstSlide = slider.querySelector('.slide');

    if(!firstSlide) firstSlide = slider.querySelector('*');

    let slideWidth = firstSlide.offsetWidth;
    let currentScroll = slider.scrollLeft;
    let maxScroll = slider.scrollWidth - slider.clientWidth;

    let maxPage = Math.round(maxScroll / slideWidth);
    let currentPage = Math.round(currentScroll / slideWidth);

    if(this.classList.contains('slider__control--next')) {
        if(currentPage < maxPage) {
            currentPage += slideNum;
            currentScroll = currentPage * slideWidth + gap;
            slider.scrollLeft = currentScroll;
        } else if(currentPage > maxPage) {
            currentPage = maxPage;
            currentScroll = maxScroll;
            slider.scrollLeft = maxScroll;
        } else {
            currentScroll = maxScroll;
            slider.scrollLeft = maxScroll;
        }

    } else if(this.classList.contains('slider__control--prev')) {
        if(currentScroll > 0) currentPage -= slideNum;
        if(currentPage < 0) currentPage = 0;

        currentScroll = currentPage * slideWidth - gap;
        slider.scrollLeft = currentScroll;
    }

    if(maxScroll - currentScroll < 20) {
        wrapper.classList.add('slider__wrapper--end');
        wrapper.classList.remove('slider__wrapper--start');
    } else {
        wrapper.classList.remove('slider__wrapper--end');
    }
    
    if(currentPage == 0) {
        wrapper.classList.add('slider__wrapper--start');
        wrapper.classList.remove('slider__wrapper--end');
    } else wrapper.classList.remove('slider__wrapper--start');
});

function moveToSlide(slider, currentPage = 0) {
    if(currentPage > 0) currentPage--;
    let wrapper = slider.closest('.slider__wrapper');
    if(wrapper.hasAttribute('data-gap')) gap = Number(wrapper.getAttribute('data-gap'));
    let firstSlide = slider.querySelector('.slide');
    let maxScroll = slider.scrollWidth - slider.clientWidth;

    if(maxScroll == 0) return;

    if(!firstSlide) firstSlide = slider.querySelector('*');

    let slideWidth = firstSlide.offsetWidth;

    let currentScroll = (slideWidth + gap) * currentPage;

    slider.scrollLeft = currentScroll;

    if(maxScroll - currentScroll < 20) {
        wrapper.classList.add('slider__wrapper--end');
        wrapper.classList.remove('slider__wrapper--start');
    } else {
        wrapper.classList.remove('slider__wrapper--end');
    }

    if(currentPage == 0) {
        wrapper.classList.add('slider__wrapper--start');
        wrapper.classList.remove('slider__wrapper--end');
    } else wrapper.classList.remove('slider__wrapper--start');
}

function checkSlider(slider) {
    let wrapper = slider.closest('.slider__wrapper');
    if(!wrapper) return;
    let firstSlide = slider.querySelector('.slide');
    if(!firstSlide) firstSlide = slider.querySelector('*');
    if(!firstSlide) return;
    let slideWidth = firstSlide.offsetWidth;

    let currentScroll = Math.ceil(slider.scrollLeft);
    let maxScroll = slider.scrollWidth - slider.clientWidth;
    let maxPage = Math.round(maxScroll / slideWidth);
    let currentPage = Math.round(currentScroll / slideWidth);

    if(maxScroll == 0) {
        wrapper.classList.add('slider__wrapper--end');
        wrapper.classList.add('slider__wrapper--start');
        return;
    }

    if(maxScroll - currentScroll < 20) wrapper.classList.add('slider__wrapper--end');
    else wrapper.classList.remove('slider__wrapper--end');

    if(currentPage == 0) wrapper.classList.add('slider__wrapper--start');
    else wrapper.classList.remove('slider__wrapper--start');
}

let sliders = document.querySelectorAll('.slider');
let sliderThrottle = false;
for(let i = 0; i < sliders.length; i++) {
    let slider = sliders[i];
    slider.classList.add('scrolling-back');
    slider.scrollLeft = 0;
    setTimeout(() => slider.classList.remove('scrolling-back'), 10);
    checkSlider(slider);
    slider.addEventListener('scroll', function() {
        if(sliderThrottle !== false) clearTimeout(sliderThrottle);
        sliderThrottle = setTimeout(() => checkSlider(this), 305);
    }, {passive: true});

    if(slider.hasAttribute('data-autoslide')) {
        let autoslide = Number(slider.getAttribute('data-autoslide'));
        if(isNaN(autoslide)) continue;
        
        runSlider(slider, autoslide);
    }
}

function runSlider(slider, autoslide) {
    setInterval(function() {
        let slideWidth = slider.offsetWidth;
        let currentScroll = slider.scrollLeft;
        let maxScroll = slider.scrollWidth - slider.clientWidth;
        let gap = 0;
        let wrapper = slider.closest('.slider__wrapper');
        if(wrapper && wrapper.hasAttribute('data-gap')) gap = Number(wrapper.getAttribute('data-gap'));
    
        let maxPage = Math.round(maxScroll / slideWidth);
        let currentPage = Math.round(currentScroll / slideWidth);
    
        currentPage++;
    
        slider.scrollLeft = currentPage * slideWidth + gap;
    
        if(currentPage >= maxPage) {
            currentPage = 0;
            setTimeout(function() {
                slider.classList.add('scrolling-back');
                setTimeout(() => slider.scrollLeft = 0, 50);
                setTimeout(() => slider.classList.remove('scrolling-back'), 50);
            }, 1000);
        }

        let dots = wrapper.querySelectorAll('.slider__dot');
        if(dots.length) {
            for(let i = 0; i < dots.length; i++) dots[i].classList.remove('slider__dot--active');
            dots[currentPage].classList.add('slider__dot--active');
        }

    }, autoslide * 1000);
}

//////////////////// END SLIDERS /////////////////////////

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
});

/////////////////////// END TABS /////////////////////////

const stickyClose = document.querySelectorAll('.sticky-promo__close');
stickyClose.forEach(close => close.addEventListener('click', (e) => e.target.closest('.sticky-promo').style.display = "none"));




function activateProductUnit(target) {
    const handle = target.getAttribute('data-handle');

    fetch('/products/' + handle + '/product.json')
    .then(response => response.json())
    .then(data => {
        const product = data.product;
        const tags = product.tags.split(', ');
        let hide = false;

        tags.forEach(tag => {
            if(tag.indexOf('hide:') === 0) {
                let _hide = tag.replace('hide:', '').split(';');
                if(hide !== false) hide.push(..._hide);
                else hide = _hide;
            } else if(tag.indexOf('early-access:') === 0) {
                let _hide = tag.replace('early-access:', '').split(';');
                if(hide !== false) hide.push(..._hide);
                else hide = _hide;
            }
        });

        let colors = {
            _count: 0
        };

        let options = '';

        product.variants.forEach(variant => {
            const opt1 = handleize(variant.option1);
            let opt2 = false;
            if(variant.option2 != null && variant.option2 != undefined) opt2 = handleize(variant.option2);

            if(hide !== false && hide.indexOf(opt1) > -1) return;

            let available = true;

            if(variant.inventory_policy == "deny" && variant.inventory_quantity == 0) {
                available = false;
            }

            let selected = false;
            if(colors._count == 0) selected = true;

            if(opt1 in colors) {
                if(colors[opt1].available === false && available === true) colors[opt1].available = true;
            } else {
                colors[opt1] = {
                    available: available,
                    selected: selected,
                    title: variant.option1,
                    url: `${shopUrl}/products/${handle}/${opt1}`
                };

                colors._count++
            }

            let img = '';
            for(let i = 0; i < product.images.length; i++) {
                const image = product.images[i];
                if(image.variant_ids.indexOf(variant.id) > -1) {
                    img = image.src;
                    break;
                }
            }

            options += `<option
                    ${selected?'selected="selected"':''}
                    data-image="${img}"
                    data-option1="${opt1}"
                    data-option2="${opt2}"
                    value="${variant.id}"
                    data-price="${formatPrice(variant.price)}"
                    ${(variant.compare_at_price && variant.compare_at_price > variant.price)?`data-cprice="${formatPrice(variant.compare_at_price)}"`:''}
                    >
                        ${variant.title}
                </option>`;
        });

        let select = document.createElement('select');
        select.classList.add('variant-select');
        select.setAttribute('name', 'id');
        select.innerHTML = options;
        target.appendChild(select);

        if(colors._count === 0) return;
        target.querySelector('.product-unit__colors-text i').innerHTML = colors._count;
        target.querySelector('.product-unit__colors').setAttribute('data-count', colors._count);

        const swatches = target.querySelector('.product-unit__swatches');

        for (const color in colors) {
            if(color == '_count') continue;
            let el = document.createElement('a');
            el.setAttribute('href', colors[color].url);
            el.classList.add('color-swatch');
            el.classList.add('color-' + color);
            el.setAttribute('title', colors[color].title);
            el.setAttribute('data-value', color);
            if(colors[color].available === false) el.classList.add('color-swatch--na');
            if(colors[color].selected === true) el.classList.add('color-swatch--active');

            swatches.appendChild(el);
        }

        if( colors._count > 3 ) {
            let extra_colors = document.createElement('a');
            extra_colors.classList.add('extra-colors');
            extra_colors.setAttribute('href', `${shopUrl}/products/${handle}`);
            extra_colors.innerHTML = '+' + (colors._count - 3);

            swatches.appendChild(extra_colors);
        }
    });
}

window.addEventListener("click", async (e) => {
    if(e.target.classList.contains('color-swatch')) {
        e.preventDefault();

        if(typeof swatchClickedCallback == 'undefined') {
            await loadScript(scripts.variants);
        }

        swatchClickedCallback(e.target);
    }
})

window.addEventListener("load", () => {
    const productUnits = document.querySelectorAll(".product-unit");
    
    let observer = new IntersectionObserver(function(entries){
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                activateProductUnit(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, {threshold: 0, rootMargin: '0px'});

    productUnits.forEach( productUnit => observer.observe(productUnit) );
});