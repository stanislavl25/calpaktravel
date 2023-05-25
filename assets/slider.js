"use strict";

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
    //console.log('Trying updateProcessTheProductUnits');
    try {
        initializeSections();
        if(intervalId && typeof variantUpdateProcess != 'undefined') {
            //console.log('variantUpdateProcess loaded');
            //console.log('clearing interval');
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

window.addEventListener("click", (e) => {
    if(e.target.classList.contains('slider__control')) {
        e.preventDefault();
        let wrapper = e.target.closest('.slider__wrapper');
        let gap = 0;
        let slideNum = 2;
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
    
        if(e.target.classList.contains('slider__control--next')) {
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
    
        } else if(e.target.classList.contains('slider__control--prev')) {
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
    }
    
    setTimeout(() => {
        console.log('trying update process via slide move')
        tryUpdateProcessTheProductUnits();
    }, 500)
    
});

function moveToSlide(slider, currentPage = 0, sliderCheckNum = 0) {
    // if(currentPage > 0) currentPage--;
    
    let wrapper = slider.closest('.slider__wrapper');
    let gap = 0;
    if(wrapper.hasAttribute('data-gap')) gap = Number(wrapper.getAttribute('data-gap'));
    const slides = slider.querySelectorAll('.slide');
    let firstSlide = slides[sliderCheckNum];
    let vertical = slider.classList.contains('slider--vertical') || (slider.classList.contains('slider--vertical-on-desktop') && window.innerWidth > 900);

    let maxScroll = 0;
    
    if(vertical) maxScroll = slider.scrollHeight - slider.clientHeight;
    else maxScroll = slider.scrollWidth - slider.clientWidth;

    if(maxScroll == 0) return;

    if(!firstSlide) firstSlide = slider.querySelector('*');

    let slideWidth = 0;

    if(vertical) {
        slideWidth = firstSlide.offsetHeight;
    } else {
        slideWidth = firstSlide.offsetWidth;
    }

    let currentScroll = (slideWidth + gap) * currentPage;

    if(vertical) {
        slider.scrollTop = currentScroll;
    } else {
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
}

function sliderThumbClick(thumb, indexFilter = false, sliderCheckNum = 0) {
    const slider = thumb.closest('.slider');
    const actives = slider.querySelectorAll('.slide--selected');
    if(actives.length > 0) actives.forEach(active => active.classList.remove('slide--selected'));
    
    thumb.classList.add('slide--selected');

    let index = getIndexWithSelector(thumb, '.slide');
    if(indexFilter !== false) index = indexFilter(index);

    moveToSlide(document.querySelector(slider.getAttribute('data-nav-for')), index, sliderCheckNum);
}

function checkSlider(slider, sliderCheckNum = 0, indexFilter = false) {
    if(!slider) return;
    let wrapper = slider.closest('.slider__wrapper');
    if(!wrapper) return;

    const slides = slider.querySelectorAll('.slide');
    let firstSlide = slides[sliderCheckNum];
    if(!firstSlide) firstSlide = slider.querySelector('*');
    if(!firstSlide) return;
    let slideWidth = 0;
    let vertical = slider.classList.contains('slider--vertical') || (slider.classList.contains('slider--vertical-on-desktop') && window.innerWidth > 900);

    let currentScroll = 0;
    let maxScroll = 0;

    if(vertical) {
        currentScroll = Math.ceil(slider.scrollTop);
        maxScroll = slider.scrollHeight - slider.clientHeight;
        slideWidth = firstSlide.offsetHeight;
    } else {
        currentScroll = Math.ceil(slider.scrollLeft);
        maxScroll = slider.scrollWidth - slider.clientWidth;
        slideWidth = firstSlide.offsetWidth;
    }

    let animateScroller = isSafari() || wrapper.classList.contains('slider__wrapper--content-slider');

    if(!wrapper.classList.contains('slider__wrapper--loaded')) {
        slider.addEventListener('scroll', function() {
            if(sliderThrottle !== false) clearTimeout(sliderThrottle);
            sliderThrottle = setTimeout(() => checkSlider(this, sliderCheckNum, indexFilter), 305);

            if(animateScroller) requestAnimationFrame(() => {
                wrapper.style.setProperty('--scroll-pos', (slider.scrollLeft * 100 / maxScroll) + '%');
            });
        }, {passive: true});

        if(slider.classList.contains("slider-nav")) {
            slider.addEventListener('click', (e) => {
                if(e.target.classList.contains('slide')) sliderThumbClick(e.target);
            });
        }

        if(slider.hasAttribute('data-autoslide')) {
            let autoslide = Number(slider.getAttribute('data-autoslide'));
            if(!isNaN(autoslide)) runSlider(slider, autoslide);
        }

        wrapper.classList.add('slider__wrapper--loaded');
    }

    let maxPage = Math.round(maxScroll / slideWidth);
    let currentPage = Math.round(currentScroll / slideWidth);
    if(isNaN(currentPage)) currentPage = 0;

    if(slider.hasAttribute('data-nav')) {
        let nav = document.querySelector(slider.getAttribute('data-nav'));
        if(nav) {
            checkSlider(nav);
            
            let actives = nav.querySelectorAll('.slide--selected');
            if(actives.length > 0) actives.forEach(active => active.classList.remove('slide--selected'));
            
            let activate = nav.querySelectorAll('.slide');

            if(indexFilter !== false) activate[indexFilter(currentPage)].classList.add('slide--selected');
            else activate[currentPage].classList.add('slide--selected');
        }
    }

    if(maxScroll == 0) {
        wrapper.classList.add('slider__wrapper--end');
        wrapper.classList.add('slider__wrapper--start');
        return;
    }

    if(maxScroll - currentScroll < 20) wrapper.classList.add('slider__wrapper--end');
    else wrapper.classList.remove('slider__wrapper--end');

    if(currentPage == 0) wrapper.classList.add('slider__wrapper--start');
    else wrapper.classList.remove('slider__wrapper--start');

    let dots = wrapper.querySelectorAll('.slider__dot');
    if(dots.length) {
        for(let i = 0; i < dots.length; i++) dots[i].classList.remove('slider__dot--active');
        if(dots.length <= currentPage) currentPage -= dots.length;
        dots[currentPage].classList.add('slider__dot--active');
    }
}

let sliderThrottle = false;
window.addEventListener("load", () => {
    const sliders = document.querySelectorAll(".slider");
    
    let observer = new IntersectionObserver(function(entries){
        entries.forEach(entry => {
            if (entry.intersectionRatio > 0) {
                observer.unobserve(entry.target);
                let slider = entry.target;
                let vertical = slider.classList.contains('slider--vertical') || (slider.classList.contains('slider--vertical-on-desktop') && window.innerWidth > 900);
                slider.classList.add('scrolling-back');
                if(vertical) slider.scrollTop = 0;
                else slider.scrollLeft = 0;
                setTimeout(() => slider.classList.remove('scrolling-back'), 10);

                checkSlider(slider);
            }
        });
    }, {threshold: 0, rootMargin: '0px'});

    sliders.forEach( slider => observer.observe(slider) );
});

function runSlider(slider, autoslide) {
    setInterval(function() {
        let wrapper = slider.closest('.slider__wrapper');
        if(wrapper.matches(':hover')) return;
        
        let vertical = slider.classList.contains('slider--vertical') || (slider.classList.contains('slider--vertical-on-desktop') && window.innerWidth > 900);
        let slideWidth = 0;
        let currentScroll = slider.scrollLeft;
        if(vertical) currentScroll = slider.scrollTop;

        let maxScroll = 0;
        
        if(vertical) {
            maxScroll = slider.scrollHeight - slider.clientHeight;
            slideWidth = slider.offsetHeight;
        } else {
            maxScroll = slider.scrollWidth - slider.clientWidth;
            slideWidth = slider.offsetWidth;
        }

        let gap = 0;
        if(wrapper && wrapper.hasAttribute('data-gap')) gap = Number(wrapper.getAttribute('data-gap'));
        
        let maxPage = Math.round(maxScroll / slideWidth);
        let currentPage = Math.round(currentScroll / slideWidth);
    
        currentPage++;
    
        if(vertical) slider.scrollTop = currentPage * slideWidth + gap;
        else slider.scrollLeft = currentPage * slideWidth + gap;

        if(currentPage >= maxPage) {
            currentPage = 0;
            setTimeout(function() {
                slider.classList.add('scrolling-back');
                if(vertical) setTimeout(() => slider.scrollTop = 0, 50);
                else setTimeout(() => slider.scrollLeft = 0, 50);
                setTimeout(() => slider.classList.remove('scrolling-back'), 50);
            }, 1000);
        }

        // let dots = wrapper.querySelectorAll('.slider__dot');
        // if(dots.length) {
        //     for(let i = 0; i < dots.length; i++) dots[i].classList.remove('slider__dot--active');
        //     dots[currentPage].classList.add('slider__dot--active');
        // }

    }, autoslide * 1000);
}

const sliderDots = document.querySelectorAll('.slider__dot');
if(sliderDots.length > 0) sliderDots.forEach(sliderDot => sliderDot.addEventListener('click', e => {
    let index = 0;
    let dots = e.target.parentNode.querySelectorAll('.slider__dot');
    let wrapper = e.target.closest('.slider__wrapper');
    if(!wrapper) return;

    for(let i = 0; i < dots.length; i++) {
        if(dots[i] == e.target) {
            index = i;
            dots[i].classList.add('slider__dot--active');
        } else dots[i].classList.remove('slider__dot--active');
    }

    moveToSlide(wrapper.querySelector('.slider'), index);
}));