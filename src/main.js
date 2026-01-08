  // === State ===
  let bill = []; // {name, price, quantity, shareable}
  let people = []; // {name, items: [{name, price, quantity}]}

  // === DOM ===
  const billList = document.getElementById('bill-list'); // tbody
  const totalSumEl = document.getElementById('total-sum');
  const peopleList = document.getElementById('people-list'); // tbody
  const remainingList = document.getElementById('remaining-list'); // tbody
  const calcDebtBtn = document.getElementById('calc-debt-btn');
  const resultList = document.getElementById('result-list'); // tbody

  const addItemBtn = document.getElementById('add-item-btn');
  const addPersonBtn = document.getElementById('add-person-btn');

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
      label.textContent = item.name + (item.shareable ? ' 👥' : '');
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
      const shareBtn = document.createElement('button');
      shareBtn.textContent = item.shareable ? '👥' : '👤';
      shareBtn.className = 'btn-toggle';
      shareBtn.title = item.shareable ? 'Отменить дележку' : 'Сделать делимой';
      shareBtn.type = 'button';
      shareBtn.onclick = () => {
        item.shareable = !item.shareable;
        renderBill();
      };
      tdAction.appendChild(shareBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✕';
      deleteBtn.className = 'btn-delete';
      deleteBtn.title = 'Удалить позицию';
      deleteBtn.type = 'button';
      deleteBtn.onclick = () => {
        const allocated = getAllocatedQuantity(item.name);
        if (allocated > 0) {
          alert(`Нельзя удалить позицию, которая назначена людям (назначено ${allocated} шт)`);
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

  function getAvailableItems() {
    const available = bill.map(i => ({...i}));
    people.forEach(p => {
      p.items.forEach(it => {
        const billItem = bill.find(b => b.name === it.name);
        const a = available.find(av => av.name === it.name);
        // For non-shareable items, subtract from available
        // For shareable items, don't subtract (can be assigned to multiple people)
        if (a && billItem && !billItem.shareable) {
          a.quantity -= it.quantity;
        }
      });
    });
    return available.filter(i => i.quantity > 0);
  }

  function getRemainingItems() {
    const remaining = bill.map(i => ({...i}));
    people.forEach(p => {
      p.items.forEach(it => {
        const billItem = bill.find(b => b.name === it.name);
        const r = remaining.find(rem => rem.name === it.name);
        // For non-shareable items, subtract from remaining
        // For shareable items, don't subtract (they stay available)
        if (r && billItem && !billItem.shareable) {
          r.quantity -= it.quantity;
        }
      });
    });
    // Filter: remove items with 0 quantity, and remove shareable items if assigned to anyone
    return remaining.filter(i => {
      if (i.quantity <= 0) return false;
      const billItem = bill.find(b => b.name === i.name);
      if (billItem && billItem.shareable) {
        // Check if this shareable item is assigned to anyone
        const isAssigned = people.some(p => p.items.some(it => it.name === i.name));
        return !isAssigned;
      }
      return true;
    });
  }

  // === Form handlers ===
  // === Modal: add item ===
  function showAddItemModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const form = document.createElement('form');
    form.classList.add('modal-form');
    form.innerHTML = `
      <h3>Добавить позицию</h3>
      <label>Название: 
        <input type="text" id="modal-item-name" placeholder="Название" required>
      </label>
      <label>Цена: 
        <input type="number" id="modal-item-price" placeholder="Цена" min="0" step="1" required>
      </label>
      <label>Количество: 
        <input type="number" id="modal-item-quantity" placeholder="Количество" min="1" step="1" value="1" required>
      </label>
      <button type="submit">Добавить</button>
      <button type="button" id="modal-cancel-item">Отмена</button>
    `;

    const nameInput = form.querySelector('#modal-item-name');
    const priceInput = form.querySelector('#modal-item-price');
    const quantityInput = form.querySelector('#modal-item-quantity');

    form.querySelector('#modal-cancel-item').onclick = () => modal.remove();

    form.onsubmit = e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const price = parseFloat(priceInput.value);
      const quantity = parseInt(quantityInput.value, 10);

      if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) return;

      // Check for duplicate item names
      if (bill.some(item => item.name === name)) {
        alert(`Позиция "${name}" уже существует`);
        return;
      }

      bill.push({name, price, quantity, shareable: false});
      renderBill();
      modal.remove();
    };

    modal.appendChild(form);
    document.body.appendChild(modal);
    nameInput.focus();
  }

  // === Modal: add person ===
  function showAddPersonModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const form = document.createElement('form');
    form.classList.add('modal-form');
    form.innerHTML = `
      <h3>Добавить человека</h3>
      <label>Имя: 
        <input type="text" id="modal-person-name" placeholder="Имя" required>
      </label>
      <button type="submit">Добавить</button>
      <button type="button" id="modal-cancel-person">Отмена</button>
    `;

    const nameInput = form.querySelector('#modal-person-name');

    form.querySelector('#modal-cancel-person').onclick = () => modal.remove();

    form.onsubmit = e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return;

      // Check for duplicate person names
      if (people.some(person => person.name === name)) {
        alert(`Человек "${name}" уже добавлен`);
        return;
      }

      people.push({name, items: []});
      renderPeople();
      modal.remove();
    };

    modal.appendChild(form);
    document.body.appendChild(modal);
    nameInput.focus();
  }

  addItemBtn.addEventListener('click', showAddItemModal);
  addPersonBtn.addEventListener('click', showAddPersonModal);

  // === Modal: add item to person ===
  function showAddItemToPerson(personIdx) {
    const available = getAvailableItems();
    if (available.length === 0) {
      alert('Нет доступных позиций для добавления');
      return;
    }

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
    available.forEach(it => {
      const opt = document.createElement('option');
      opt.value = it.name;
      opt.textContent = `${it.name} — ${it.quantity} шт`;
      select.appendChild(opt);
    });

    const updateMaxQuantity = () => {
      const selectedItem = available.find(it => it.name === select.value);
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
      const item = available.find(it => it.name === name);
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
    
    // Accumulate debt per person (in kopeks to avoid float errors)
    const debtKopeks = {};
    people.forEach(p => {
      debtKopeks[p.name] = 0;
    });

    // Track which shareable items we've already processed
    const processedShareable = new Set();

    // Process each person's items
    people.forEach(p => {
      p.items.forEach(it => {
        const billItem = bill.find(b => b.name === it.name);
        if (!billItem) return;

        if (billItem.shareable) {
          // Check if we've already processed this shareable item
          if (processedShareable.has(it.name)) return;
          processedShareable.add(it.name);

          // Find all people who have this shareable item
          const peopleWithItem = new Set();
          people.forEach(person => {
            if (person.items.some(item => item.name === it.name)) {
              peopleWithItem.add(person.name);
            }
          });

          // Get total cost for this bill item (in kopeks)
          const totalCostKopeks = Math.round(billItem.price * billItem.quantity * 100);

          // Divide equally among people who have it
          const costPerPersonKopeks = Math.floor(totalCostKopeks / peopleWithItem.size);
          const remainder = totalCostKopeks % peopleWithItem.size;
          
          let index = 0;
          peopleWithItem.forEach(personName => {
            // Distribute remainder by adding 1 kopek to first few people
            const adjustment = index < remainder ? 1 : 0;
            debtKopeks[personName] += costPerPersonKopeks + adjustment;
            index++;
          });
        } else {
          // Non-shareable: person pays full cost of their portion
          const costKopeks = Math.round(it.price * it.quantity * 100);
          debtKopeks[p.name] += costKopeks;
        }
      });
    });

    // Render results (convert back to rubles)
    Object.entries(debtKopeks).forEach(([name, kopeks]) => {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = name;
      const tdSum = document.createElement('td');
      tdSum.textContent = `${(kopeks / 100).toFixed(2)} ₽`;
      tr.appendChild(tdName);
      tr.appendChild(tdSum);
      resultList.appendChild(tr);
    });
  };

  // === Initial render ===
  renderBill();
  renderPeople();