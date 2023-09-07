if(isPDP() && typeof product !== 'undefined'){
    addToRecentlyViewed(product);
}

document.addEventListener('DOMContentLoaded', (e) => {
    endrockExperiment('qeJYb_riQmCiKFQHKwk89w').then(variant => {
        if(variant === '1'){
            renderRecenltyViewed();
        }
    });

    renderRecenltyViewed();
})


function renderRecenltyViewed(){
    if(isCollectionPage()){
        console.log('Experiment Running: Recently Viewed')
        const recentlyViewed = getRecentlyViewed();
        recentlyViewed.forEach(product => {
            const cards = document.querySelectorAll(`[data-id="${product.id}"]`);
            cards.forEach(card => {
                let labelWrapper = card.querySelector('.floating-labels');
                let currentLabel = labelWrapper.querySelector('.product-label:not(.product-label--na):not(.product-label--sale):not(.product-label--hidden):not([data-options])');

                if(currentLabel && window.getComputedStyle(currentLabel).display !== 'none'){
                    currentLabel.innerText = "Previously Viewed";
                } else {
                    let label = document.createElement('div');
                    label.classList.add("product-label");
                    label.innerText = "Previously Viewed";
                    label.style.display = "flex";
                    labelWrapper.appendChild(label);
                }                
            })
        });
    }
}

/**
 * Check Path for collections
 * @returns {Boolean}
 */
function isCollectionPage(){
    return window.location.pathname.indexOf('collections') > -1;
}

/**
 * Check Path for collections
 * @returns {Boolean}
 */
function isPDP(){
    return window.location.pathname.indexOf('products') > -1;
}

/**
 * Add Recently Viewed Product to Session Storage
 * @param {Object} product
 */
function addToRecentlyViewed(product) {
    const recentlyViewed = JSON.parse(sessionStorage.getItem('recentlyViewed')) || [];
    
    if (!recentlyViewed.find(x => x.id === product.id) || !recentlyViewed) {
      recentlyViewed.unshift(product); // Add to the beginning of the array
      
      // Store the updated list in sessionStorage (limit to, e.g., 5 items)
      sessionStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed.slice(0, 15)));
    }
}

/**
 * Get array of products
 * @returns {Array} 
 */
function getRecentlyViewed() {
    return JSON.parse(sessionStorage.getItem('recentlyViewed')) || [];
}