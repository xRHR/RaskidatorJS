// === Состояние ===
let bill = []; // {name, price, quantity}
let people = []; // {name, items: [{name, price, quantity}]}

// === DOM ===
const billList = document.getElementById('bill-list');
const totalSumEl = document.getElementById('total-sum');
const addItemBtn = document.getElementById('add-item-btn');

const peopleList = document.getElementById('people-list');
const addPersonBtn = document.getElementById('add-person-btn');

const remainingList = document.getElementById('remaining-list');
const calcDebtBtn = document.getElementById('calc-debt-btn');
const resultList = document.getElementById('result-list');

// === Функции ===
function renderBill() {
  billList.innerHTML = '';
  bill.forEach(item => {
    const li = document.createElement('li');
    li.textContent = `${item.name} — ${item.price} ₽ × ${item.quantity}`;
    billList.appendChild(li);
  });

  const total = bill.reduce((sum, i) => sum + i.price * i.quantity, 0);
  totalSumEl.textContent = total.toFixed(2);
  renderRemaining();
}

function renderPeople() {
  peopleList.innerHTML = '';
  people.forEach((p, idx) => {
    const li = document.createElement('li');
    li.textContent = p.name;

    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Добавить позицию';
    addBtn.onclick = () => addItemToPerson(idx);

    const personItems = document.createElement('ul');
    p.items.forEach(it => {
      const itLi = document.createElement('li');
      itLi.textContent = `${it.name} — ${it.price} ₽ × ${it.quantity}`;
      personItems.appendChild(itLi);
    });

    li.appendChild(addBtn);
    li.appendChild(personItems);
    peopleList.appendChild(li);
  });

  renderRemaining();
}

function renderRemaining() {
  remainingList.innerHTML = '';
  const remaining = getRemainingItems();
  remaining.forEach(it => {
    const li = document.createElement('li');
    li.textContent = `${it.name} — ${it.price} ₽ × ${it.quantity}`;
    remainingList.appendChild(li);
  });
}

// Возвращает массив с остатками
function getRemainingItems() {
  const remaining = bill.map(i => ({...i}));
  people.forEach(p => {
    p.items.forEach(it => {
      const r = remaining.find(rem => rem.name === it.name);
      if (r) r.quantity -= it.quantity;
    });
  });
  return remaining.filter(i => i.quantity > 0);
}

// === Добавление ===
addItemBtn.onclick = () => {
  const name = prompt('Название позиции');
  const price = Number(prompt('Цена'));
  const quantity = Number(prompt('Количество'));

  if (!name || !price || !quantity) return alert('Неверные данные');

  bill.push({name, price, quantity});
  renderBill();
};

addPersonBtn.onclick = () => {
  const name = prompt('Имя человека');
  if (!name) return;
  people.push({name, items: []});
  renderPeople();
};

// Добавляем позицию человеку
function addItemToPerson(personIdx) {
  const remaining = getRemainingItems();
  if (remaining.length === 0) return alert('Нет остатков');

  const names = remaining.map(it => it.name).join(', ');
  const name = prompt(`Какая позиция? Остатки: ${names}`);
  const item = remaining.find(it => it.name === name);
  if (!item) return alert('Нет такой позиции');

  const quantity = Number(prompt(`Сколько? Осталось: ${item.quantity}`));
  if (!quantity || quantity > item.quantity) return alert('Неверное количество');

  people[personIdx].items.push({name: item.name, price: item.price, quantity});
  renderPeople();
}

// === Раскидываем долг ===
calcDebtBtn.onclick = () => {
  const remaining = getRemainingItems();
  if (remaining.length > 0) return alert('Есть остатки, нельзя раскидать');

  resultList.innerHTML = '';
  people.forEach(p => {
    const sum = p.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const li = document.createElement('li');
    li.textContent = `${p.name} — ${sum.toFixed(2)} ₽`;
    resultList.appendChild(li);
  });
};

// === Первичный рендер ===
renderBill();
renderPeople();
