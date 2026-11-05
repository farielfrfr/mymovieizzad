const { ipcRenderer } = require('electron');

const searchBtn = document.getElementById('searchBtn');
const movieResult = document.getElementById('movieResult');
const suggestBtn = document.getElementById('suggestBtn');
const suggestionResult = document.getElementById('suggestionResult');
const calcBtn = document.getElementById('calcBtn');
const calcResult = document.getElementById('calcResult');
const openWatchlistBtn = document.getElementById('openWatchlistBtn');

let currentMovieData = null;

searchBtn.addEventListener('click', async () => {
  const title = document.getElementById('movieTitle').value.trim();
  
  if (!title) {
    movieResult.innerHTML = `<p class="error">Please enter a movie title to search.</p>`;
    return;
  }

  movieResult.innerHTML = `<p>Searching movies...</p>`;
  const apiKey = 'trilogy';
  const searchUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${apiKey}`;

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.Response === 'False') {
      movieResult.innerHTML = `<p class="error">No movies found! Please try another title.</p>`;
      return;
    }

    let choicesHTML = `<h3>Select a movie from results:</h3><div class="choices-grid">`;
    
    data.Search.slice(0, 6).forEach((movie) => {
      const posterUrl = (movie.Poster && movie.Poster !== 'N/A') ? movie.Poster : '';
      const imgTag = posterUrl ? `<img src="${posterUrl}" alt="${movie.Title}" />` : `<div class="no-poster">No Image</div>`;

      choicesHTML += `
        <div class="choice-card choice-btn" data-id="${movie.imdbID}">
          ${imgTag}
          <div class="choice-info">
            <strong>${movie.Title}</strong>
            <p>(${movie.Year})</p>
          </div>
        </div>
      `;
    });
    
    choicesHTML += `</div>`;
    movieResult.innerHTML = choicesHTML;

    document.querySelectorAll('.choice-btn').forEach((card) => {
      card.addEventListener('click', () => {
        const imdbID = card.getAttribute('data-id');
        getMovieDetails(imdbID);
      });
    });

  } catch (error) {
    movieResult.innerHTML = `<p class="error">Failed to connect to API. Please check your internet connection.</p>`;
  }
});

async function getMovieDetails(imdbID) {
  movieResult.innerHTML = `<p>Loading movie details...</p>`;
  const apiKey = 'trilogy';
  const detailUrl = `https://www.omdbapi.com/?i=${imdbID}&apikey=${apiKey}`;

  try {
    const res = await fetch(detailUrl);
    const data = await res.json();

    currentMovieData = data;

    const info1_TitleYear = `${data.Title} (${data.Year})`;
    const info2_Genre = data.Genre || 'N/A';
    const info3_DirectorActors = `Director: ${data.Director} | Cast: ${data.Actors}`;
    const info4_Rating = data.imdbRating ? `${data.imdbRating} / 10 (${data.imdbVotes} votes)` : 'No rating';
    const info5_Plot = data.Plot || 'No plot summary available.';
    const posterUrl = (data.Poster && data.Poster !== 'N/A') ? data.Poster : '';

    let posterHTML = '';
    if (posterUrl) {
      posterHTML = `<img src="${posterUrl}" alt="${data.Title}" style="width: 150px; border-radius: 8px; margin-bottom: 15px; display: block;" />`;
    }

    movieResult.innerHTML = `
      ${posterHTML}
      <h3>${info1_TitleYear}</h3>
      <p><strong>1. Genre:</strong> ${info2_Genre}</p>
      <p><strong>2. Cast & Crew:</strong> ${info3_DirectorActors}</p>
      <p><strong>3. IMDb Rating:</strong> ${info4_Rating}</p>
      <p><strong>4. Plot Summary:</strong> ${info5_Plot}</p>
      <p><strong>5. Runtime & Box Office:</strong> ${data.Runtime} | ${data.BoxOffice || 'N/A'}</p>
      <button id="addWatchlistBtn">Add to Watchlist</button>
    `;

    document.getElementById('addWatchlistBtn').addEventListener('click', () => {
      addToWatchlist(data.Title, data.Genre, data.Runtime);
    });

  } catch (error) {
    movieResult.innerHTML = `<p class="error">Failed to fetch details.</p>`;
  }
}

suggestBtn.addEventListener('click', async () => {
  const genre = document.getElementById('genreSelect').value;
  const timePref = document.getElementById('timeSelect').value;

  if (!genre || !timePref) {
    suggestionResult.innerHTML = `<p class="error">Please select both genre and available time preference!</p>`;
    return;
  }

  let selectedTitle = '';
  let reason = '';

  if (genre === 'Action' && timePref === 'Short') {
    selectedTitle = 'Taken';
    reason = 'Fast-paced, non-stop action under 95 minutes!';
  } else if (genre === 'Action' && timePref === 'Standard') {
    selectedTitle = 'John Wick';
    reason = 'Balanced runtime with top-tier gun-fu choreography.';
  } else if (genre === 'Action' && timePref === 'Epic') {
    selectedTitle = 'The Dark Knight';
    reason = 'Grand action masterpiece over 2.5 hours with high IMDb rating.';
  } else if (genre === 'Comedy' && timePref === 'Short') {
    selectedTitle = 'Liar Liar';
    reason = 'Quick, hilarious Jim Carrey comedy perfect for short breaks.';
  } else if (genre === 'Comedy' && timePref === 'Standard') {
    selectedTitle = 'The Hangover';
    reason = 'Classic comedy night pick with standard viewing duration.';
  } else if (genre === 'Comedy' && timePref === 'Epic') {
    selectedTitle = 'The Wolf of Wall Street';
    reason = 'Wild 3-hour comedy drama for a full movie night marathon.';
  } else if (genre === 'Sci-Fi' && timePref === 'Short') {
    selectedTitle = 'Ex Machina';
    reason = 'Tight, intense sci-fi thriller under 110 minutes.';
  } else if (genre === 'Sci-Fi' && timePref === 'Standard') {
    selectedTitle = 'Inception';
    reason = 'Mind-bending blockbuster with perfect pacing.';
  } else if (genre === 'Sci-Fi' && timePref === 'Epic') {
    selectedTitle = 'Interstellar';
    reason = 'Deep space exploration epic spanning nearly 3 hours.';
  } else if (genre === 'Horror' && timePref === 'Short') {
    selectedTitle = 'A Quiet Place';
    reason = 'Short 90-minute intense horror experience.';
  } else if (genre === 'Horror' && timePref === 'Standard') {
    selectedTitle = 'The Conjuring';
    reason = 'Standard-length haunted house horror packed with scares.';
  } else if (genre === 'Horror' && timePref === 'Epic') {
    selectedTitle = 'IT';
    reason = 'Longer horror adaptation rich in character development and suspense.';
  } else if (genre === 'Drama' && timePref === 'Short') {
    selectedTitle = 'Whiplash';
    reason = 'High-intensity music drama under 110 minutes.';
  } else if (genre === 'Drama' && timePref === 'Standard') {
    selectedTitle = 'The Shawshank Redemption';
    reason = 'Top-rated IMDb drama ideal for standard feature movie sessions.';
  } else {
    selectedTitle = 'Oppenheimer';
    reason = '3-hour epic historical drama masterpiece.';
  }

  suggestionResult.innerHTML = `<p>Fetching live movie suggestion from API...</p>`;
  const apiKey = 'trilogy';
  const suggestUrl = `https://www.omdbapi.com/?t=${encodeURIComponent(selectedTitle)}&apikey=${apiKey}`;

  try {
    const res = await fetch(suggestUrl);
    const data = await res.json();

    if (data.Response === 'False') {
      suggestionResult.innerHTML = `<p class="error">No movie suggestion found from API.</p>`;
      return;
    }

    const posterUrl = (data.Poster && data.Poster !== 'N/A') ? data.Poster : '';
    let posterHTML = '';
    if (posterUrl) {
      posterHTML = `<img src="${posterUrl}" alt="${data.Title}" style="width: 120px; border-radius: 6px; margin-bottom: 10px; display: block;" />`;
    }

    suggestionResult.innerHTML = `
      ${posterHTML}
      <p><strong>Suggested Movie:</strong> ${data.Title} (${data.Year})</p>
      <p><strong>Genre:</strong> ${data.Genre}</p>
      <p><strong>Runtime:</strong> ${data.Runtime}</p>
      <p><strong>IMDb Rating:</strong> ${data.imdbRating} / 10</p>
      <p><strong>Recommendation Rule:</strong> ${reason}</p>
      <button id="addSuggestedBtn">Add Suggestion to Watchlist</button>
    `;

    document.getElementById('addSuggestedBtn').addEventListener('click', () => {
      addToWatchlist(data.Title, data.Genre, data.Runtime);
    });

  } catch (error) {
    suggestionResult.innerHTML = `<p class="error">Failed to fetch suggestion from API.</p>`;
  }
});

calcBtn.addEventListener('click', () => {
  const runtime = Number(document.getElementById('runtimeInput').value);
  const count = Number(document.getElementById('countInput').value);

  if (runtime <= 0 || count <= 0) {
    calcResult.innerHTML = `<p class="error">Please enter valid positive numbers for runtime and movie count.</p>`;
    return;
  }

  const totalMinutes = runtime * count;
  const totalHours = totalMinutes / 60;

  calcResult.innerHTML = `
    <p><strong>Total Watch Time in Minutes:</strong> ${totalMinutes} mins</p>
    <p><strong>Total Watch Time in Hours:</strong> ${totalHours.toFixed(1)} hours</p>
  `;
});

function addToWatchlist(title, genre, runtime) {
  let watchlist = JSON.parse(localStorage.getItem('myMovieWatchlist')) || [];
  
  if (watchlist.some(item => item.title.toLowerCase() === title.toLowerCase())) {
    alert(`"${title}" is already in your watchlist!`);
    return;
  }

  const newItem = {
    id: Date.now(),
    title: title,
    genre: genre || 'N/A',
    runtime: runtime || 'N/A',
    status: 'Plan to Watch',
    notes: 'Added from main page'
  };

  watchlist.push(newItem);
  localStorage.setItem('myMovieWatchlist', JSON.stringify(watchlist));
  ipcRenderer.send('save-watchlist-file', watchlist);

  alert(`Added "${title}" to your Watchlist!`);
}

openWatchlistBtn.addEventListener('click', () => {
  ipcRenderer.send('open-watchlist-window');
});