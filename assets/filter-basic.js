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