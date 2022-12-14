let colViewButtons = document.querySelectorAll('.col-view__button');
if(colViewButtons.length > 0) colViewButtons.forEach(colViewButton => colViewButton.addEventListener('click', (e) => {
    e.target.closest('.shopify-section--col-filter').classList.toggle('col-filter--larger-active');
}));

let filterActivators = document.querySelectorAll('.filter__activator');
if(filterActivators.length > 0) filterActivators.forEach(filterActivator => filterActivator.addEventListener('click', async (e) => {

    if(typeof renderColorGroups === 'undefined') {
        await loadScript(scripts.filter);
    }

    let selectedFilter = false;
    if(e.target.classList.contains('filter__activator--color')) selectedFilter = 'color'
    else if(e.target.classList.contains('filter__activator--sort')) selectedFilter = 'sort';

    if(document.querySelector('.collection-filters').getAttribute('data-active') == selectedFilter)
        document.querySelector('.collection-filters').removeAttribute('data-active');
    else document.querySelector('.collection-filters').setAttribute('data-active', selectedFilter);
}));

const filterCollections = document.querySelectorAll('.filter__collection');
if(filterCollections.length) filterCollections.forEach(filterCollection => filterCollection.addEventListener('click', async (e) => {
    const target = e.target.closest('.filter__collection');
    const prnt = target.closest('.filter__collections');
    const actives = prnt.querySelectorAll('.filter__collection--active');
    let clickingActive = false;
    if(actives.length) actives.forEach(active => {
        if(active == target) clickingActive = true;
        active.classList.remove('filter__collection--active');
    });

    if(clickingActive) prnt.classList.remove('filter__collections--active');
    else {
        prnt.classList.add('filter__collections--active');
        target.classList.toggle('filter__collection--active');
    }

    if(typeof renderColorGroups === 'undefined') {
        await loadScript(scripts.filter);
    }
}));


window.addEventListener("load", () => {
    document.querySelector('.collection-filter--sort').style.width = `calc(${document.querySelector('.site-header .site-header__nav').offsetWidth}px - 2 * var(--gap))`;
});