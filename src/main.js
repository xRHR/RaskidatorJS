  // === State ===
  let bill = []; // {name, price, quantity}
  let people = []; // {name, items: [{name, price, quantity}]}

  // === DOM ===
  const billList = document.getElementById('bill-list'); // tbody
  const totalSumEl = document.getElementById('total-sum');
  const peopleList = document.getElementById('people-list'); // tbody
  const remainingList = document.getElementById('remaining-list'); // tbody
  const calcDebtBtn = document.getElementById('calc-debt-btn');
  const resultList = document.getElementById('result-list'); // tbody

  const addItemForm = document.getElementById('add-item-form');
  const itemNameInput = document.getElementById('item-name');
  const itemPriceInput = document.getElementById('item-price');
  const itemQuantityInput = document.getElementById('item-quantity');

  const addPersonForm = document.getElementById('add-person-form');
  const personNameInput = document.getElementById('person-name');

  // === Renderers ===
  // helper: total allocated quantity for an item name across all people
  function getAllocatedQuantity(name) {
    let allocated = 0;
    people.forEach(p => {
      p.items.forEach(it => {
        if (it.name === name) allocated += it.quantity;
      });
    });
    return allocated;
  }

  function renderBill() {
    billList.innerHTML = '';
    bill.forEach((item, idx) => {
      const tr = document.createElement('tr');

      const tdLabel = document.createElement('td');
      const label = document.createElement('span');
      label.className = 'item-label';
      label.textContent = item.name;
      tdLabel.appendChild(label);

      const tdQty = document.createElement('td');
      const qtyInput = document.createElement('input');
      qtyInput.type = 'number';
      qtyInput.min = 1;
      qtyInput.step = 1;
      qtyInput.value = item.quantity;
      qtyInput.style.width = '5rem';
      qtyInput.addEventListener('change', () => {
        const newQty = parseInt(qtyInput.value, 10);
        if (isNaN(newQty) || newQty < 1) {
          qtyInput.value = item.quantity;
          return;
        }
        const allocated = getAllocatedQuantity(item.name);
        if (newQty < allocated) {
          alert(`Нельзя установить количество меньше уже назначенного: ${allocated}`);
          qtyInput.value = item.quantity;
          return;
        }
        item.quantity = newQty;
        renderBill();
      });
      tdQty.appendChild(qtyInput);

      const tdPrice = document.createElement('td');
      tdPrice.textContent = `${item.price.toFixed(2)} ₽`;

      const tdAction = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✕';
      deleteBtn.className = 'btn-delete';
      deleteBtn.title = 'Удалить позицию';
      deleteBtn.type = 'button';
      deleteBtn.onclick = () => {
        const remaining = getRemainingItems();
        if (remaining.length === 0) {
          alert('Нельзя удалять позиции, когда нет остатков');
          return;
        }
        bill.splice(idx, 1);
        renderBill();
      };
      tdAction.appendChild(deleteBtn);

      tr.appendChild(tdLabel);
      tr.appendChild(tdQty);
      tr.appendChild(tdPrice);
      tr.appendChild(tdAction);
      billList.appendChild(tr);
    });

    const total = bill.reduce((sum, i) => sum + i.price * i.quantity, 0);
    totalSumEl.textContent = total.toFixed(2);
    renderRemaining();
  }

  function renderPeople() {
    peopleList.innerHTML = '';
    people.forEach((p, idx) => {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      const nameSpan = document.createElement('span');
      nameSpan.className = 'person-name';
      nameSpan.textContent = p.name;

      const addBtn = document.createElement('button');
      addBtn.textContent = '+';
      addBtn.className = 'btn-add';
      addBtn.title = 'Добавить позицию';
      addBtn.type = 'button';
      addBtn.onclick = () => showAddItemToPerson(idx);

      tdName.appendChild(nameSpan);
      tdName.appendChild(addBtn);

      const tdItems = document.createElement('td');
      const itemsTable = document.createElement('table');
      itemsTable.className = 'person-items';
      const itemsTbody = document.createElement('tbody');
      p.items.forEach((it, itemIdx) => {
        const itemTr = document.createElement('tr');

        const itemTdLabel = document.createElement('td');
        const itNameSpan = document.createElement('span');
        itNameSpan.className = 'item-label';
        itNameSpan.textContent = `${it.name} — ${it.price.toFixed(2)} ₽`;
        itemTdLabel.appendChild(itNameSpan);

        const itemTdQty = document.createElement('td');
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.min = 1;
        qtyInput.step = 1;
        qtyInput.value = it.quantity;
        qtyInput.style.width = '4.5rem';
        qtyInput.addEventListener('change', () => {
          const newQty = parseInt(qtyInput.value, 10);
          if (isNaN(newQty) || newQty < 1) {
            qtyInput.value = it.quantity;
            return;
          }
          // available = bill total for this item - allocated by others
          const totalAllocated = getAllocatedQuantity(it.name);
          const allocatedOthers = totalAllocated - it.quantity;
          const billItem = bill.find(b => b.name === it.name);
          const billTotal = billItem ? billItem.quantity : 0;
          const available = billTotal - allocatedOthers;
          if (newQty > available) {
            alert(`Недоступно столько штук. Доступно: ${available}`);
            qtyInput.value = it.quantity;
            return;
          }
          it.quantity = newQty;
          renderPeople();
          renderBill();
        });
        itemTdQty.appendChild(qtyInput);

        const itemTdAction = document.createElement('td');
        const deleteItemBtn = document.createElement('button');
        deleteItemBtn.textContent = '✕';
        deleteItemBtn.className = 'btn-delete';
        deleteItemBtn.title = 'Удалить позицию';
        deleteItemBtn.type = 'button';
        deleteItemBtn.onclick = () => {
          p.items.splice(itemIdx, 1);
          renderPeople();
        };
        itemTdAction.appendChild(deleteItemBtn);

        itemTr.appendChild(itemTdLabel);
        itemTr.appendChild(itemTdQty);
        itemTr.appendChild(itemTdAction);
        itemsTbody.appendChild(itemTr);
      });
      itemsTable.appendChild(itemsTbody);
      tdItems.appendChild(itemsTable);

      tr.appendChild(tdName);
      tr.appendChild(tdItems);
      peopleList.appendChild(tr);
    });

    renderRemaining();
  }

  function renderRemaining() {
    remainingList.innerHTML = '';
    const remaining = getRemainingItems();
    remaining.forEach(it => {
      const tr = document.createElement('tr');
      const tdLabel = document.createElement('td');
      tdLabel.textContent = it.name;
      const tdQty = document.createElement('td');
      tdQty.textContent = it.quantity;
      tr.appendChild(tdLabel);
      tr.appendChild(tdQty);
      remainingList.appendChild(tr);
    });
  }

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

  // === Form handlers ===
  addItemForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = itemNameInput.value.trim();
    const price = parseFloat(itemPriceInput.value);
    const quantity = parseInt(itemQuantityInput.value, 10);

    if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) return;

    bill.push({name, price, quantity});
    renderBill();

    addItemForm.reset();
  });

  addPersonForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = personNameInput.value.trim();
    if (!name) return;
    people.push({name, items: []});
    renderPeople();
    addPersonForm.reset();
  });

  // === Modal: add item to person ===
  function showAddItemToPerson(personIdx) {
    const remaining = getRemainingItems();
    if (remaining.length === 0) return; // no remaining items

    const modal = document.createElement('div');
    modal.classList.add('modal');

    const form = document.createElement('form');
    form.classList.add('modal-form');
    form.innerHTML = `
      <h3>Добавить позицию для ${people[personIdx].name}</h3>
      <label>Позиция: 
        <select id="select-item"></select>
      </label>
      <label>Количество: 
        <input type="number" id="item-quantity-person" min="1" step="1" value="1" required>
      </label>
      <button type="submit">Добавить</button>
      <button type="button" id="cancel-btn">Отмена</button>
    `;

    const select = form.querySelector('#select-item');
    const quantityInput = form.querySelector('#item-quantity-person');
    remaining.forEach(it => {
      const opt = document.createElement('option');
      opt.value = it.name;
      opt.textContent = `${it.name} — ${it.quantity} шт`;
      select.appendChild(opt);
    });

    const updateMaxQuantity = () => {
      const selectedItem = remaining.find(it => it.name === select.value);
      if (selectedItem) {
        quantityInput.max = selectedItem.quantity;
        if (!quantityInput.value) quantityInput.value = 1;
        if (parseInt(quantityInput.value, 10) > selectedItem.quantity) {
          quantityInput.value = selectedItem.quantity;
        }
      }
    };

    updateMaxQuantity();
    select.addEventListener('change', updateMaxQuantity);

    form.querySelector('#cancel-btn').onclick = () => modal.remove();

    form.onsubmit = e => {
      e.preventDefault();
      const name = select.value;
      const quantity = parseInt(quantityInput.value, 10);
      const item = remaining.find(it => it.name === name);
      if (!item || quantity <= 0 || quantity > item.quantity) return;

      people[personIdx].items.push({name: item.name, price: item.price, quantity});
      renderPeople();
      modal.remove();
    };

    modal.appendChild(form);
    document.body.appendChild(modal);
  }

  // === Calculate debt ===
  calcDebtBtn.onclick = () => {
    const remaining = getRemainingItems();
    if (remaining.length > 0) return alert('Есть остатки, нельзя раскидать');

    resultList.innerHTML = '';
    people.forEach(p => {
      const sum = p.items.reduce((s, it) => s + it.price * it.quantity, 0);
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = p.name;
      const tdSum = document.createElement('td');
      tdSum.textContent = `${sum.toFixed(2)} ₽`;
      tr.appendChild(tdName);
      tr.appendChild(tdSum);
      resultList.appendChild(tr);
    });
  };

  // === Initial render ===
  renderBill();
  renderPeople();