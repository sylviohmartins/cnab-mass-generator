(() => {
  // Load layouts from localStorage or initialize
  let layouts = JSON.parse(localStorage.getItem('cnabLayouts') || '[]');
  let editingLayoutIndex = null;
  let editingRecordIndex = null;

  const layoutsSection = document.getElementById('layouts-section');
  const layoutFormSection = document.getElementById('layout-form-section');
  const recordsSection = document.getElementById('records-section');
  const recordFormSection = document.getElementById('record-form-section');
  const rulerSection = document.getElementById('ruler-section');

  const newLayoutBtn = document.getElementById('new-layout-btn');
  const addFieldBtn = document.getElementById('add-field-btn');
  const cancelLayoutBtn = document.getElementById('cancel-layout-btn');

  const newRecordBtn = document.getElementById('new-record-btn');
  const cancelRecordBtn = document.getElementById('cancel-record-btn');

  const downloadRecordsBtn = document.getElementById('download-records-btn');

  const layoutFormTitle = document.getElementById('layout-form-title');
  const layoutForm = document.getElementById('layout-form');
  const layoutNameInput = document.getElementById('layout-name');
  const fieldsTableBody = document.querySelector('#fields-table tbody');

  const layoutsTableBody = document.querySelector('#layouts-table tbody');

  const layoutSelect = document.getElementById('layout-select');
  const recordsTableBody = document.querySelector('#records-table tbody');
  const recordForm = document.getElementById('record-form');
  const recordFieldsDiv = document.getElementById('record-fields');
  const recordFormTitle = document.getElementById('record-form-title');

  const rulerView = document.getElementById('ruler-view');

  function saveLayouts() {
    localStorage.setItem('cnabLayouts', JSON.stringify(layouts));
  }

  function renderLayouts() {
    layoutsTableBody.innerHTML = '';
    layouts.forEach((layout, index) => {
      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      tdName.textContent = layout.name;
      const tdActions = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.onclick = () => openLayoutForm(index);
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Excluir';
      deleteBtn.onclick = () => {
        if (confirm('Excluir este layout?')) {
          layouts.splice(index, 1);
          saveLayouts();
          renderLayouts();
          renderLayoutSelect();
          recordsSection.classList.add('hidden');
          rulerSection.classList.add('hidden');
        }
      };
      tdActions.appendChild(editBtn);
      tdActions.appendChild(deleteBtn);
      tr.appendChild(tdName);
      tr.appendChild(tdActions);
      layoutsTableBody.appendChild(tr);
    });
  }

  function renderLayoutSelect() {
    layoutSelect.innerHTML = '';
    layouts.forEach((layout, idx) => {
      const option = document.createElement('option');
      option.value = idx;
      option.textContent = layout.name;
      layoutSelect.appendChild(option);
    });
  }

  newLayoutBtn.addEventListener('click', () => {
    openLayoutForm(null);
  });

  function openLayoutForm(index) {
    editingLayoutIndex = index;
    fieldsTableBody.innerHTML = '';
    if (index === null) {
      layoutFormTitle.textContent = 'Novo Layout';
      layoutNameInput.value = '';
    } else {
      layoutFormTitle.textContent = 'Editar Layout';
      const layout = layouts[index];
      layoutNameInput.value = layout.name;
      layout.fields.forEach(field => {
        addFieldRow(field);
      });
    }
    layoutsSection.classList.add('hidden');
    layoutFormSection.classList.remove('hidden');
  }

  function addFieldRow(field = { name:'', start:'', length:'', type:'alfa' }) {
    const tr = document.createElement('tr');
    tr.classList.add('field-row');
    const tdName = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = field.name;
    tdName.appendChild(nameInput);

    const tdStart = document.createElement('td');
    const startInput = document.createElement('input');
    startInput.type = 'number';
    startInput.value = field.start;
    tdStart.appendChild(startInput);

    const tdLength = document.createElement('td');
    const lengthInput = document.createElement('input');
    lengthInput.type = 'number';
    lengthInput.value = field.length;
    tdLength.appendChild(lengthInput);

    const tdType = document.createElement('td');
    const typeSelect = document.createElement('select');
    ['alfa','num'].forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t.toUpperCase();
      if (field.type === t) opt.selected = true;
      typeSelect.appendChild(opt);
    });
    tdType.appendChild(typeSelect);

    const tdActions = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remover';
    removeBtn.onclick = () => {
      tr.remove();
    };
    tdActions.appendChild(removeBtn);

    tr.appendChild(tdName);
    tr.appendChild(tdStart);
    tr.appendChild(tdLength);
    tr.appendChild(tdType);
    tr.appendChild(tdActions);
    fieldsTableBody.appendChild(tr);
  }

  addFieldBtn.addEventListener('click', () => {
    addFieldRow();
  });

  cancelLayoutBtn.addEventListener('click', () => {
    layoutFormSection.classList.add('hidden');
    layoutsSection.classList.remove('hidden');
  });

  layoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = layoutNameInput.value.trim();
    if (!name) {
      alert('Nome do layout é obrigatório');
      return;
    }
    const fields = [];
    let valid = true;
    Array.from(fieldsTableBody.children).forEach(row => {
      const inputs = row.getElementsByTagName('input');
      const selects = row.getElementsByTagName('select');
      const fname = inputs[0].value.trim();
      const fstart = parseInt(inputs[1].value);
      const flength = parseInt(inputs[2].value);
      const ftype = selects[0].value;
      if (!fname || isNaN(fstart) || isNaN(flength)) {
        valid = false;
      } else {
        fields.push({ name: fname, start: fstart, length: flength, type: ftype });
      }
    });
    if (!valid || fields.length === 0) {
      alert('Campos inválidos no layout');
      return;
    }
    fields.sort((a,b) => a.start - b.start);
    const layout = { name, fields, records: [] };
    if (editingLayoutIndex === null) {
      layouts.push(layout);
    } else {
      layouts[editingLayoutIndex] = layout;
    }
    saveLayouts();
    renderLayouts();
    renderLayoutSelect();
    layoutFormSection.classList.add('hidden');
    layoutsSection.classList.remove('hidden');
  });

  layoutSelect.addEventListener('change', () => {
    const idx = parseInt(layoutSelect.value);
    if (!isNaN(idx)) {
      showRecordsSection(idx);
    }
  });

  function showRecordsSection(index) {
    recordsSection.classList.remove('hidden');
    recordFormSection.classList.add('hidden');
    rulerSection.classList.add('hidden');
    renderRecords(index);
  }

  newRecordBtn.addEventListener('click', () => {
    const layoutIdx = parseInt(layoutSelect.value);
    openRecordForm(layoutIdx, null);
  });

  function openRecordForm(layoutIdx, recordIdx) {
    editingRecordIndex = recordIdx;
    recordFieldsDiv.innerHTML = '';
    const layout = layouts[layoutIdx];
    recordFormTitle.textContent = recordIdx === null ? 'Novo Registro' : 'Editar Registro';
    layout.fields.forEach((field, idx) => {
      const row = document.createElement('div');
      row.classList.add('record-row');
      const label = document.createElement('label');
      label.textContent = field.name + ': ';
      const input = document.createElement('input');
      input.type = 'text';
      if (recordIdx !== null) {
        input.value = layout.records[recordIdx][field.name] || '';
      }
      row.appendChild(label);
      row.appendChild(input);
      recordFieldsDiv.appendChild(row);
    });
    recordsSection.classList.add('hidden');
    recordFormSection.classList.remove('hidden');
  }

  cancelRecordBtn.addEventListener('click', () => {
    recordFormSection.classList.add('hidden');
    recordsSection.classList.remove('hidden');
  });

  recordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const layoutIdx = parseInt(layoutSelect.value);
    const layout = layouts[layoutIdx];
    const record = {};
    let valid = true;
    recordFieldsDiv.querySelectorAll('.record-row').forEach((row, idx) => {
      const fieldName = layout.fields[idx].name;
      const input = row.querySelector('input');
      let val = input.value;
      if (layout.fields[idx].type === 'num' && !/^[0-9]*$/.test(val)) {
        valid = false;
      }
      record[fieldName] = val;
    });
    if (!valid) {
      alert('Valores inválidos no registro');
      return;
    }
    if (editingRecordIndex === null) {
      layout.records.push(record);
    } else {
      layout.records[editingRecordIndex] = record;
    }
    saveLayouts();
    renderRecords(layoutIdx);
    recordFormSection.classList.add('hidden');
    recordsSection.classList.remove('hidden');
  });

  function renderRecords(layoutIdx) {
    const layout = layouts[layoutIdx];
    recordsTableBody.innerHTML = '';
    layout.records.forEach((record, rIdx) => {
      const tr = document.createElement('tr');
      const tdIndex = document.createElement('td');
      tdIndex.textContent = (rIdx + 1).toString();
      const tdData = document.createElement('td');
      let preview = '';
      layout.fields.forEach(field => {
        let val = record[field.name] || '';
        if (field.type === 'num') {
          val = val.padStart(field.length, '0').slice(0, field.length);
        } else {
          val = val.padEnd(field.length, ' ').slice(0, field.length);
        }
        preview += val;
      });
      tdData.textContent = preview;
      const tdActions = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.onclick = () => openRecordForm(layoutIdx, rIdx);
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Excluir';
      deleteBtn.onclick = () => {
        if (confirm('Excluir registro?')) {
          layout.records.splice(rIdx, 1);
          saveLayouts();
          renderRecords(layoutIdx);
        }
      };
      const rulerBtn = document.createElement('button');
      rulerBtn.textContent = 'Régua';
      rulerBtn.onclick = () => {
        showRuler(preview, layout.fields);
      };
      tdActions.appendChild(editBtn);
      tdActions.appendChild(deleteBtn);
      tdActions.appendChild(rulerBtn);
      tr.appendChild(tdIndex);
      tr.appendChild(tdData);
      tr.appendChild(tdActions);
      recordsTableBody.appendChild(tr);
    });
  }

  downloadRecordsBtn.addEventListener('click', () => {
    const layoutIdx = parseInt(layoutSelect.value);
    const layout = layouts[layoutIdx];
    let content = '';
    layout.records.forEach(record => {
      let line = '';
      layout.fields.forEach(field => {
        let val = record[field.name] || '';
        if (field.type === 'num') {
          val = val.padStart(field.length, '0').slice(0, field.length);
        } else {
          val = val.padEnd(field.length, ' ').slice(0, field.length);
        }
        line += val;
      });
      content += line + '\n';
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = layout.name + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  function showRuler(recordString, fields) {
    rulerView.innerHTML = '';
    rulerSection.classList.remove('hidden');
    const rulerDiv = document.createElement('div');
    rulerDiv.classList.add('ruler');
    let current = 0;
    fields.forEach((field, idx) => {
      const seg = document.createElement('div');
      seg.classList.add('segment');
      if (idx === 0) {
        seg.classList.add('header');
      } else {
        seg.classList.add('body');
      }
      const value = recordString.substr(current, field.length);
      seg.style.width = (field.length * 10) + 'px';
      seg.textContent = value;
      const label = document.createElement('div');
      label.classList.add('label');
      label.textContent = field.name;
      const pos = document.createElement('div');
      pos.classList.add('pos');
      pos.textContent = field.start + '-' + (field.start + field.length - 1);
      seg.appendChild(label);
      seg.appendChild(pos);
      rulerDiv.appendChild(seg);
      current += field.length;
    });
    rulerView.appendChild(rulerDiv);
  }

  // Initial render
  renderLayouts();
  renderLayoutSelect();
  if (layouts.length > 0) {
    layoutSelect.value = '0';
    showRecordsSection(0);
  }
})();
