'use strict'

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */
const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		h1: document.querySelector('.h1'),
		progressPercent: document.querySelector('.progress__percent'),
		progressCoverBar: document.querySelector('.progress__cover-bar')
	},
	content: {
		daysContainer: document.getElementById('days'),
		nextDay: document.querySelector('.habit__day'),
	},
	popup: {
		index: document.getElementById('add-habbit_popup'),
		iconField: document.querySelector('.popup__form input[name="icon"]')
		
	}
}

/* utils */
function loadData () {
	const habitsString = localStorage.getItem(HABBIT_KEY);
	const habitArray = JSON.parse(habitsString);
	if (Array.isArray(habitArray)) {
		habbits = habitArray
	}
}

function saveData () {
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function toglePopup() {
	if (page.popup.index.classList.contains('cover_hidden')){
		page.popup.index.classList.remove('cover_hidden');
	} else {
		page.popup.index.classList.add('cover_hidden');
	}
}

function resetForm(form, fields) {
	for (const field of fields) {
		form[field].value = ''
		}
}
function validateAndFormData(form, fields) {
	const formData = new FormData(form)
	const res = {};
	for (const field of fields) {
		const fieldValue = formData.get(field);
		form[field].classList.remove('error');
		if (!fieldValue) {
			form[field].classList.add('error');
		}
		res[field] = fieldValue
	}
	let isValid = true;
	for (const field of fields) {
		if (!res[field]){
			isValid = false
		}
	}
	if (!isValid){
		return
	}
	return res;
}
/*rendr*/

function rerenderMenu(activHabbit) {
	for (const habbit of habbits) {
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);
		if (!existed) {
			// Создание
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => rerender(habbit.id))
			element.innerHTML = `<img src="images/${habbit.icon}.svg" alt="${habbit.name}">`
			if (activHabbit.id === habbit.id) {
				element.classList.add('menu__item_active')
			}
			page.menu.appendChild(element)
			continue;
		}
		if (activHabbit.id === habbit.id) {
			existed.classList.add('menu__item_active')
		} else {
			existed.classList.remove('menu__item_active')
		}
	}
}

function renderHead(activHabbit) {
	page.header.h1.innerText = activHabbit.name;
	const progress = activHabbit.days.length / activHabbit.target > 1
		? 100
		: activHabbit.days.length /activHabbit.target * 100;
	page.header.progressPercent.innerText = progress.toFixed(0) + '%';
	page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`)
}

function renderContent(activHabbit) {
	page.content.daysContainer.innerHTML = '';
	for (const index in activHabbit.days) {
		const element = document.createElement('div');
		element.classList.add('habit');
		element.innerHTML = `<div class="habit__day">День ${Number(index) + 1}</div>
			<div class="habit__comment">${activHabbit.days[index].comment}</div>
			<button class="habit__del" onclick="delDdays(${index})">
				<img src="./images/delete.svg" alt="Удалить день ${index + 1}" />
			</button>`;
		page.content.daysContainer.appendChild(element);
	}
	page.content.nextDay.innerHTML = `День ${activHabbit.days.length + 1}`;
}

function rerender(activHabbitId) {
	globalActiveHabbitId = activHabbitId
	const activHabbit = habbits.find(habbit => habbit.id === activHabbitId);
	if (!activHabbit) {
		return
	}
	document.location.replace(document.location.pathname + '#' + activHabbitId);
	rerenderMenu(activHabbit);
	renderHead(activHabbit);
	renderContent(activHabbit)
}

/* work with days*/
function addDays(event) {
	event.preventDefault();
	const data = validateAndFormData(event.target, ['comment']);
	if (!data) {
		return;
	}
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{comment: data.comment}])
			}
		}
		return habbit;
	});
	resetForm(event.target, ['comment']);
	rerender(globalActiveHabbitId);
	saveData();
}

function delDdays(index) {
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			habbit.days.splice(index, 1);
			return {
				...habbit,
				days: habbit.days
			}
		}
		return habbit;
	});
	rerender(globalActiveHabbitId);
	saveData();
}


/* working with habbits*/

function setIcon(context, icon) {
	page.popup.iconField.value = icon;
	const activIcon = document.querySelector('.icon.icon_active');
	activIcon.classList.remove('icon_active');
	context.classList.add('icon_active')
}

function addHabbit(event) {
	event.preventDefault();
	const data = validateAndFormData(event.target, ['name', 'icon', 'target']);
	if (!data) {
		return;
	}
	const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
	habbits.push({
		id: maxId + 1,
		name: data.name,
		target: data.target,
		icon: data.icon,
		days: []
	});
	resetForm(event.target, ['name', 'target']);
	toglePopup();
	saveData();
	rerender(maxId + 1);
}

/*init*/
(() => {
	loadData();
	const hashId = Number(document.location.hash.replace('#', ''))
	const urlGabbit = habbits.find(habbit => habbit.id == hashId);
	if (urlGabbit) {
		rerender(urlGabbit.id)
	} else {
		rerender(habbits[0].id);
	}
})()

