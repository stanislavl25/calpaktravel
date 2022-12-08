"use strict";

const filterGroupList = document.querySelector('.slider--filt-col');

function renderColorGroups() {
    for(let color in color_groups) {
        let el = document.createElement('button');
        el.classList.add('slide');
        el.classList.add('filt-col-group');
        el.setAttribute('title', color);
        el.innerHTML = `<span class="color-group color-group-${color}"></span>${color}`;
        filterGroupList.appendChild(el);
    }
}

if(filterGroupList) renderColorGroups();