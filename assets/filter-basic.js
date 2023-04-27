//////////////////////// View more/less products per line ///////////////////////
let productImagesSizes;
let colViewButtons = document.querySelectorAll('.col-view__button');
const filteredContainer = document.querySelector('.shopify-section--product-grid');

if(colViewButtons.length > 0) colViewButtons.forEach(colViewButton => colViewButton.addEventListener('click', (e) => {
    const prnt = e.target.closest('.collection-view');
    const buttons = prnt.querySelectorAll('.col-view__button');
    const target = e.target.closest('.col-view__button');
    for(let i = 0; i < buttons.length; i++) {
        if(buttons[i] == target) buttons[i].setAttribute('aria-current', true);
        else buttons[i].setAttribute('aria-current', false);
    }
    const filterEl = e.target.closest('.shopify-section--col-filter');

    const allProductsImages = filteredContainer.querySelectorAll('.product-unit .product-unit__image img');
    if(filterEl.classList.contains('col-filter--larger-active')) {
        filterEl.classList.remove('col-filter--larger-active');
        allProductsImages.forEach(allProductsImage => allProductsImage.setAttribute('sizes', productImagesSizes));
    } else {
        filterEl.classList.add('col-filter--larger-active');
        allProductsImages.forEach(allProductsImage => allProductsImage.setAttribute('sizes', '(min-width: 901px) 33.33vw, (min-width: 651px) 50vw, 100vw'));
    }
}));

/////////////////////// Filter popup activators ///////////////////////
let filterActivators = document.querySelectorAll('.filter__activator');
if(filterActivators.length > 0) filterActivators.forEach(filterActivator => filterActivator.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if(typeof renderColorGroups === 'undefined') {
        await loadScript(scripts.filter);
    }

    const filters = document.querySelector('.collection-filters');
    if(!filters.classList.contains('collection-filters--loaded')) initFilter();

    if(filters.classList.contains('collection-filters-banner')) {
        document.querySelector('.shopify-section--collection-image-banner').classList.add('banner-active');
    }

    if(e.target.classList.contains('filter__activator--sort')) filters.setAttribute('data-tab', 'sort');
    else filters.setAttribute('data-tab', 'color');

    filters.setAttribute('aria-expanded', true);
    filters.classList.add('collection-filters--active');
}));

/////////////////////// Filter collections activators ///////////////////////
const filterCategories = document.querySelectorAll('button.collections-category');
filterCategories.forEach(filterCategory => filterCategory.addEventListener('click', async (e) => {
    const target = e.target.closest('.collections-category');
    const prnt = target.closest('.collections-menu');
    const actives = prnt.querySelectorAll('.collections-category--active');
    let clickingActive = false;
    
    if(actives.length) actives.forEach(active => {
        if(active == target) clickingActive = true;
        active.classList.remove('collections-category--active');
    });

    if(!clickingActive) target.classList.add('collections-category--active');
    
    if(typeof renderColorGroups === 'undefined') {
        await loadScript(scripts.filter);
    }

    applyFilter('collections');
}));


window.addEventListener("load", () => {
    const emptyProductCount = document.querySelector('.collections-category i:empty');
    if(emptyProductCount) {
        emptyProductCount.innerHTML = document.querySelectorAll('.product-grid .product-unit').length;
    }
    
    const filtersCont = document.querySelector('.collection-filters__section');
    if(filtersCont) {
        window.addEventListener('click', () => {
            const filters = document.querySelector('.collection-filters');
            if(filters.classList.contains('collection-filters-banner')) {
                document.querySelector('.shopify-section--collection-image-banner').classList.remove('banner-active');
            }
            filters.setAttribute('aria-expanded', false);
            filters.classList.remove('collection-filters--active');
        });

        filtersCont.addEventListener('click', e => e.stopPropagation());
    }
    
    productImagesSizes = filteredContainer.querySelector('.shopify-section--product-grid .product-unit .product-unit__image img');
    if(productImagesSizes) productImagesSizes = productImagesSizes.getAttribute('sizes');
});

const filterCollections = document.querySelectorAll('.filter__collection');
if(filterCollections.length) filterCollections.forEach(filterCollection => filterCollection.addEventListener('click', async (e) => {
    e.preventDefault();
    const target = e.target.closest('.filter__collection');
    const prnt = target.closest('.filter__collections');
    const actives = prnt.querySelectorAll('.filter__collection--selected');
    let clickingActive = false;
    if(actives.length) actives.forEach(active => {
        if(active == target) clickingActive = true;
        active.classList.remove('filter__collection--selected');
    });

    if(clickingActive) prnt.classList.remove('filter__collections--focus');
    else {
        prnt.classList.add('filter__collections--focus');
        target.classList.add('filter__collection--selected');
    }

    window.history.replaceState({}, '', target.getAttribute('href'));

    if(typeof renderColorGroups === 'undefined') {
        await loadScript(scripts.filter);
    }

    applyFilter('collections');
}));