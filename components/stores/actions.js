// $lib/stores/actions.js

import { writable } from 'svelte/store';
import Papa from 'papaparse';

const filePath = '/static/data/actions.csv';

const actionsStore = writable([]);

// Function to load the CSV file
async function loadCSV() {
  const response = await fetch(filePath);
  const csvText = await response.text();
  const parsed = Papa.parse(csvText, { header: false });
  actionsStore.set(parsed.data.flat());
}

// Function to save the CSV file
async function saveCSV(data) {
  const csvText = Papa.unparse(data.map(item => [item]));
  await fetch(filePath, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/csv',
    },
    body: csvText,
  });
}

// CRUD Operations
const addAction = (newAction) => {
  actionsStore.update(actions => {
    const updatedActions = [...actions, newAction];
    saveCSV(updatedActions);
    return updatedActions;
  });
};

const updateAction = (index, updatedAction) => {
  actionsStore.update(actions => {
    const updatedActions = [...actions];
    updatedActions[index] = updatedAction;
    saveCSV(updatedActions);
    return updatedActions;
  });
};

const deleteAction = (index) => {
  actionsStore.update(actions => {
    const updatedActions = actions.filter((_, i) => i !== index);
    saveCSV(updatedActions);
    return updatedActions;
  });
};

// Load CSV initially
loadCSV();

export { actionsStore, addAction, updateAction, deleteAction };