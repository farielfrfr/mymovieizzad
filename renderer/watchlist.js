const { ipcRenderer } = require('electron');

const crudForm = document.getElementById('crudForm');
const editIdInput = document.getElementById('editId');
const inputTitle = document.getElementById('inputTitle');
const inputGenre = document.getElementById('inputGenre');
const inputRuntime = document.getElementById('inputRuntime');
const inputStatus = document.getElementById('inputStatus');
const inputNotes = document.getElementById('inputNotes');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const watchlistContainer = document.getElementById('watchlistContainer');

document.addEventListener('DOMContentLoaded', loadWatchlist);

function getWatchlist() {
  return JSON.parse(localStorage.getItem('myMovieWatchlist')) || [];
}

function saveWatchlist(data) {
  localStorage.setItem('myMovieWatchlist', JSON.stringify(data));
  ipcRenderer.send('save-watchlist-file', data);
  loadWatchlist();
}

function loadWatchlist() {
  const watchlist = getWatchlist();
  watchlistContainer.innerHTML = '';

  if (watchlist.length === 0) {
    watchlistContainer.innerHTML = `<p>No movies saved in your watchlist yet. Add some above!</p>`;
    return;
  }

  const table = document.createElement('table');
  table.className = 'watchlist-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>Title</th>
        <th>Genre</th>
        <th>Runtime</th>
        <th>Status</th>
        <th>Notes</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  watchlist.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.title}</strong></td>
      <td>${item.genre}</td>
      <td>${item.runtime}</td>
      <td><span class="badge ${item.status.replace(/\s+/g, '-').toLowerCase()}">${item.status}</span></td>
      <td>${item.notes || '-'}</td>
      <td>
        <button class="action-btn edit-btn" onclick="setupEdit(${item.id})">Edit</button>
        <button class="action-btn delete-btn" onclick="deleteRecord(${item.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  watchlistContainer.appendChild(table);
}

crudForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = inputTitle.value.trim();
  const genre = inputGenre.value.trim();
  const runtime = inputRuntime.value.trim();
  const status = inputStatus.value;
  const notes = inputNotes.value.trim();

  if (!title || !genre || !runtime) {
    alert('Please fill out all required fields.');
    return;
  }

  let watchlist = getWatchlist();
  const editId = editIdInput.value;

  if (editId) {
    watchlist = watchlist.map((item) => {
      if (item.id === parseInt(editId)) {
        return { ...item, title, genre, runtime, status, notes };
      }
      return item;
    });
    alert(`Updated "${title}" successfully!`);
  } else {
    const newMovie = {
      id: Date.now(),
      title,
      genre,
      runtime,
      status,
      notes,
    };
    watchlist.push(newMovie);
    alert(`Saved "${title}" to your watchlist!`);
  }

  saveWatchlist(watchlist);
  resetForm();
});

window.setupEdit = function (id) {
  const watchlist = getWatchlist();
  const item = watchlist.find((m) => m.id === id);
  if (!item) return;

  editIdInput.value = item.id;
  inputTitle.value = item.title;
  inputGenre.value = item.genre;
  inputRuntime.value = item.runtime;
  inputStatus.value = item.status;
  inputNotes.value = item.notes;

  cancelEditBtn.style.display = 'inline-block';
};

window.deleteRecord = function (id) {
  if (confirm('Are you sure you want to remove this movie from your watchlist?')) {
    let watchlist = getWatchlist();
    watchlist = watchlist.filter((item) => item.id !== id);
    saveWatchlist(watchlist);
    alert('Record deleted successfully.');
  }
};

cancelEditBtn.addEventListener('click', resetForm);

function resetForm() {
  editIdInput.value = '';
  crudForm.reset();
  cancelEditBtn.style.display = 'none';
}