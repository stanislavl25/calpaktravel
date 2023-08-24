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
        let slideNum = 1;
        const btnPrev = wrapper.querySelector('.slider__control--prev');
        const btnNext = wrapper.querySelector('.slider__control--next');

        btnNext.setAttribute('aria-label', 'Next slide');
        btnPrev.setAttribute('aria-label', 'Previous slide');

        if(wrapper.hasAttribute('data-gap')) gap = Number(wrapper.getAttribute('data-gap'));
        if(wrapper.hasAttribute('data-slide')) slideNum = Number(wrapper.getAttribute('data-slide'));
        if(window.innerWidth <= 900 && wrapper.hasAttribute('data-slide-mob')) slideNum = Number(wrapper.getAttribute('data-slide-mob'));
        let slider = wrapper.querySelector('.slider');
        let firstSlide = slider.querySelector('.slide');
        const sliderItems = Array.from(document.querySelectorAll('.product-unit'));

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
                for(let i=0; i < sliderItems.length; i++){
                    let isVisible =
                                    sliderItems[i].offsetLeft >= currentScroll &&
                                    sliderItems[i].offsetLeft < currentScroll + slider.clientWidth - 1;
                    
                    
                    if(firstSlide) {
                        sliderItems[i].setAttribute('aria-hidden', 'false')
                    }
                    if(isVisible) {
                        sliderItems[i].setAttribute('aria-hidden', 'false');
                        sliderItems[i].setAttribute('tabindex', '0');
                    } else {
                        sliderItems[i].setAttribute('aria-hidden', 'true');
                        sliderItems[i].setAttribute('tabindex', '-1');
                    }
                }
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
            for(let i=0; i < sliderItems.length; i++){
                let isVisible =
                sliderItems[i].offsetLeft <= currentScroll &&
                sliderItems[i].offsetLeft > currentScroll - slider.clientWidth;
                
                
                if(firstSlide) {
                    sliderItems[i].setAttribute('aria-hidden', 'true')
                }
                if(isVisible) {
                    sliderItems[i].setAttribute('aria-hidden', 'false');
                    sliderItems[i].setAttribute('tabindex', '0');
                }else if(!isVisible) {
                    sliderItems[i].setAttribute('aria-hidden', 'true');
                    sliderItems[i].setAttribute('tabindex', '-1');
                }
                 else {
                    sliderItems[i].setAttribute('aria-hidden', 'true');
                    sliderItems[i].setAttribute('tabindex', '-1');
                }
            }
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

        if(wrapper.classList.contains('slider__wrapper--start')){
            btnPrev.setAttribute('disabled', 'disabled');
        } else {
            btnPrev.removeAttribute('disabled');
        }

        if(wrapper.classList.contains('slider__wrapper--end')){
            btnNext.setAttribute('disabled', 'disabled');
        } else {
            btnNext.removeAttribute('disabled');
        }
    }
    // let timesTryed = 0;
    // setTimeout(() => {
    //     if (timesTryed < 100) {
    //         console.log('trying update process via slide move')
    //         tryUpdateProcessTheProductUnits();
    //         timesTryed += 1;
    //     }
    // }, 500)
    
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
    if(actives.length > 0) actives.forEach(active => {
        active.classList.remove('slide--selected')
        active.removeAttribute('aria-current');
    });
    
    thumb.classList.add('slide--selected');
    thumb.setAttribute('aria-current', 'true');

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

    let maxPage = Math.round(maxScroll / slideWidth);
    let currentPage = Math.round(currentScroll / slideWidth);
    if(isNaN(currentPage)) currentPage = 0;

    let animateScroller = isSafari() || wrapper.classList.contains('slider__wrapper--content-slider');

    if(!wrapper.classList.contains('slider__wrapper--loaded')) {
        slider.addEventListener('scroll', function() {
            if(sliderThrottle !== false) clearTimeout(sliderThrottle);
            sliderThrottle = setTimeout(() => {
                const thisSlider = this;
                let currentScroll = Math.ceil(slider.scrollLeft);
                let firstSlide = slider.querySelector('*');
                let slideWidth = firstSlide.offsetWidth;
                let currentPage = Math.round(currentScroll / slideWidth);

                let event = new CustomEvent("sliderUpdate",
                    {
                        bubbles: true,
                        detail: {
                            slider: thisSlider,
                            slideNumber: currentPage
                        }
                    }
                );
                document.dispatchEvent(event);

                checkSlider(thisSlider, sliderCheckNum, indexFilter)
            }, 305);

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

        let dots = wrapper.querySelectorAll('.slider__dot');
        if(dots.length) {
            for(let i = 0; i < dots.length; i++){
                dots[i].classList.remove('slider__dot--active');
                dots[i].setAttribute('aria-current','false');
                dots[currentPage].classList.add('slider__dot--active');
                dots[currentPage].setAttribute('aria-current','true');
                const slides = document.querySelectorAll('.reviews__slider .reviews__slide');
                for(let i = 0; i < slides.length; i++){
                    if(slides[i].getAttribute('data-index') == currentPage) {
                        slides[i].classList.add('reviews__slide--active');
                        slides[i].setAttribute("tabindex", "0");
                        slides[i].setAttribute("aria-hidden", "false");
                        const childNodes = slides[i].querySelectorAll('a, button');
                        console.log(childNodes);
                        childNodes.forEach(child => {
                            child.setAttribute("tabindex", "0");
                            child.setAttribute("aria-hidden", "false");
                        });
                    } else {
                        slides[i].classList.remove('reviews__slide--active');
                        slides[i].setAttribute("tabindex", "-1");
                        slides[i].setAttribute("aria-hidden", "true");
                        const childNodes = slides[i].querySelectorAll('a, button'); 
                        console.log(childNodes);
                        childNodes.forEach(child => {
                            child.setAttribute("tabindex", "-1");
                            child.setAttribute("aria-hidden", "true");
                        });
                    }
                }
            }
        }

    }, autoslide * 1000);
    
}

const sliderDots = document.querySelectorAll('.slider__dot button');
if(sliderDots.length > 0) sliderDots.forEach(sliderDot => sliderDot.addEventListener('click', e => {
    let index = 0;
    let dots = e.target.parentNode.querySelectorAll('.slider__dot');
    let wrapper = e.target.closest('.slider__wrapper');
    if(!wrapper) return;

    for(let i = 0; i < dots.length; i++) {
        if(dots[i] == e.target) {
            index = i;
            dots[i].classList.add('slider__dot--active');
            dots[i].setAttribute('aria-current','true');
        } else {
            dots[i].classList.remove('slider__dot--active');
            dots[i].setAttribute('aria-current','false');
        }
    }

    moveToSlide(wrapper.querySelector('.slider'), index);
}));

const changeSlides = e => {
    let index = 0;
    let dots;
    let wrapper;
    let thisDot;
    if(e.target.tagName.toLowerCase() === 'button') {
        thisDot = e.target.parentNode;
        dots = e.target.parentNode.parentNode.querySelectorAll('.slider__dot');
        wrapper = e.target.parentNode.closest('.slider__wrapper');
    } else {
        thisDot = e.target;
        dots = e.target.parentNode.querySelectorAll('.slider__dot');
        wrapper = e.target.closest('.slider__wrapper');
    }
    if(!wrapper) return;

    for(let i = 0; i < dots.length; i++) {
        if(dots[i] == thisDot) {
            index = i;
            dots[i].classList.add('slider__dot--active');
            dots[i].setAttribute('aria-current','true');
        } else {
            dots[i].classList.remove('slider__dot--active');
            dots[i].setAttribute('aria-current','false');
        }
    }

    moveToSlide(wrapper.querySelector('.slider'), index);
};
if(sliderDots.length > 0) sliderDots.forEach(sliderDot => sliderDot.addEventListener('click', changeSlides));

const sliderDotsButton = document.querySelectorAll('.slider__dot button');
if(sliderDots.length > 0) sliderDots.forEach(sliderDotButton => sliderDotButton.addEventListener('click', changeSlides));