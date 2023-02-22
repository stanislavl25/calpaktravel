//////////////////////// View more/less products per line ///////////////////////
let colViewButtons = document.querySelectorAll('.col-view__button');
if(colViewButtons.length > 0) colViewButtons.forEach(colViewButton => colViewButton.addEventListener('click', (e) => {
    const prnt = e.target.closest('.collection-view');
    let buttons = prnt.querySelectorAll('.col-view__button');
    let target = e.target.closest('.col-view__button');
    for(let i = 0; i < buttons.length; i++) {
        if(buttons[i] == target) buttons[i].setAttribute('aria-current', true);
        else buttons[i].setAttribute('aria-current', false);
    }
    e.target.closest('.shopify-section--col-filter').classList.toggle('col-filter--larger-active');
}));

/////////////////////// Filter popup activators ///////////////////////
let filterActivators = document.querySelectorAll('.filter__activator');
if(filterActivators.length > 0) filterActivators.forEach(filterActivator => filterActivator.addEventListener('click', async (e) => {

    if(typeof renderColorGroups === 'undefined') {
        await loadScript(scripts.filter);
    }

    const filters = document.querySelector('.collection-filters');
    if(!filters.classList.contains('collection-filters--loaded')) initFilter();

    if(e.target.classList.contains('filter__activator--sort')) filters.setAttribute('data-tab', 'sort');
    else filters.setAttribute('data-tab', 'color');

    filters.setAttribute('aria-expanded', true);
    filters.classList.add('collection-filters--active');
}));

/////////////////////// Filter collections activators ///////////////////////
const filterCategories = document.querySelectorAll('.collections-category');
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

    applyFilter();
}));


window.addEventListener("load", () => {
    const allProducts = document.querySelector('.collections-category--all');
    if(allProducts) {
        allProducts.querySelector('i').innerHTML = document.querySelectorAll('.product-grid .product-unit').length;
    }
    
});

const filterCollections = document.querySelectorAll('.filter__collection');
if(filterCollections.length) filterCollections.forEach(filterCollection => filterCollection.addEventListener('click', async (e) => {
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

    if(typeof renderColorGroups === 'undefined') {
        await loadScript(scripts.filter);
    }

    applyFilter();
}));