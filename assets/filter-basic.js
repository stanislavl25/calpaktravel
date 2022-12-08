let colViewButtons = document.querySelectorAll('.col-view__button');
if(colViewButtons.length > 0) colViewButtons.forEach(colViewButton => colViewButton.addEventListener('click', (e) => {
    e.target.closest('.shopify-section--col-filter').classList.toggle('col-filter--larger-active');
}));

let filterActivators = document.querySelectorAll('.filter__activator');
if(filterActivators.length > 0) filterActivators.forEach(filterActivator => filterActivator.addEventListener('click', async (e) => {

    if(typeof renderColorGroups === 'undefined') {
        await loadScript(scripts.filter);
    }

    document.querySelector('.collection-filters').style.display = 'block';
}));