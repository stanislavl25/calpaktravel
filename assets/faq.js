"use strict";

document.addEventListener('DOMContentLoaded', function(){
    /*
    var questions = document.querySelectorAll('.faq-question');
    if(questions.length) {
        for(let i = 0; i < questions.length; i++) {
            questions[i].addEventListener('click', function(e) {
                e.preventDefault();
                var prnt = this.parentNode;
                if(prnt.classList.contains('active')) {
                    prnt.classList.remove('active');
                } else {
                    var active = prnt.parentNode.getElementsByClassName('active');
                    if(active.length) {
                        for(let j = 0; j < active.length; j++) {
                            active[j].classList.remove('active');
                        }
                    }
                    prnt.classList.add('active');
                    var offs = $(prnt).offset().top;
                    if(offs < window.scrollY + 120) {
                        window.scrollTo(0, offs - 120);
                    }
                }
            });
        }
    }

    var cat_headers = document.querySelectorAll('.faq-category-header');
    if(cat_headers.length) {
        for(let i = 0; i < cat_headers.length; i++) {
            cat_headers[i].addEventListener('click', function() {
                this.classList.toggle('active');
            });
        }
    }
    */

    let hash = location.hash;
    if(hash) {
        let anchor = document.querySelector(`.scroll-anchor[id="${hash.replace('#', '')}"]`);
        if(anchor) {
            anchor.closest('.accordion').classList.add('accordion--active');
            //anchor.closest('.accordion').setAttribute('aria-expanded', 'true');
            anchor.closest('.faq-category-container').classList.add('faq-category-container--active');
        }
    }
});

const faqCatTitles = document.querySelectorAll('.faq-category-title');
if(faqCatTitles.length) {
    let faq_nav = document.querySelector('.faq-navigation');

    if(faq_nav) for(let i = 0; i < faqCatTitles.length; i++) {
        faq_nav.innerHTML += '<h3><a class="slide button button--secondary" href="#faq--' + handleize(faqCatTitles[i].innerHTML) + '"><span>' + faqCatTitles[i].innerHTML + '</span></a></h3>';

        faqCatTitles[i].addEventListener('click', function(e) {
            e.preventDefault();

            const cont = this.closest('.faq-category-container');
            if(cont.classList.contains('faq-category-container--active')) {
                cont.classList.remove('faq-category-container--active');
            } else {
                cont.classList.add('faq-category-container--active');
                let firstQ = cont.querySelector('.accordion__title');
                if(firstQ) firstQ.click();
            }
        });
    }

    let sidebar = document.querySelector('.shopify-section--faq-sidebar');
    if(sidebar) sidebar.style.gridRow = `3 / span ${faqCatTitles.length}`;
}