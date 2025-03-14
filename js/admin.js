

const API_BASE_URL = 'http://localhost:8001/api';

// Load movies on page load
document.addEventListener('DOMContentLoaded', loadMovies);

async function loadMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        const movies = await response.json();
        displayMovies(movies);
        initializeDragAndDrop();
    } catch (error) {
        console.error('Error loading movies:', error);
        alert('Error loading movies: ' + error.message);
    }
}

function displayMovies(movies) {
    const tableBody = document.getElementById('movieTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    movies.forEach(movie => {
        const row = document.createElement('tr');
        row.classList.add('MovieItemsRow')
        row.innerHTML = renderMovieRow(movie);
        tableBody.appendChild(row);
    });
}

// Modal functions
let currentMovieId = null;

window.openMovieModal = function (movieId) {
    currentMovieId = movieId;
    const modal = document.getElementById('movieModal');
    const modalTitle = document.getElementById('modalTitle');

    if (movieId) {
        modalTitle.textContent = 'Edit Movie';
        loadMovieData(movieId);
    } else {
        modalTitle.textContent = 'Add New Movie';
        document.getElementById('movieForm').reset();
        clearScreenshotsAndDownloadLinks();
    }

    modal.style.display = 'block';
}

window.closeMovieModal = function () {
    document.getElementById('movieModal').style.display = 'none';
    document.getElementById('movieForm').reset();
    clearScreenshotsAndDownloadLinks();
    currentMovieId = null;
}

function clearScreenshotsAndDownloadLinks() {
    document.getElementById('screenshotsList').innerHTML = `
        <div class="screenshot-item">
            <input type="url" name="screenshots[]" placeholder="Screenshot URL">
        </div>
    `;
    document.getElementById('downloadLinksList').innerHTML = `
        <div class="download-link-item">
            <input type="text" name="qualities[]" placeholder="Quality (e.g., 1080p)">
            <input type="url" name="downloadLinks[]" placeholder="Download Link">
        </div>
    `;
    document.getElementById('categoryList').innerHTML = `
     <div class="screenshot-item">
            <input type="text" name="categories[]" placeholder="Screenshot URL">
        </div>
    `

}

window.addScreenshotField = function () {
    const container = document.getElementById('screenshotsList');
    const div = document.createElement('div');
    div.className = 'screenshot-item';
    div.innerHTML = `
        <input type="url" name="screenshots[]" placeholder="Screenshot URL">
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}


window.addCategoryField = function () {
    const container = document.getElementById('categoryList');
    const div = document.createElement('div');
    div.className = 'screenshot-item';
    div.innerHTML = `
        <input type="text" name="categories[]" placeholder="Enter Category">
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

window.Capitalizer = function (str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

window.addDownloadLinkField = function () {
    const container = document.getElementById('downloadLinksList');
    const div = document.createElement('div');
    div.className = 'download-link-item';
    div.innerHTML = `
        <input type="text" name="qualities[]" placeholder="Quality (e.g., 1080p)">
        <input type="url" name="downloadLinks[]" placeholder="Download Link">
        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    container.appendChild(div);
}

async function loadMovieData(movieId) {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        const movie = await response.json();

        document.getElementById('title').value = movie.title;
        document.getElementById('year').value = movie.year;
        document.getElementById('rating').value = movie.rating || '';
        document.getElementById('description').value = movie.description || '';
        document.getElementById('posterUrl').value = movie.posterUrl || '';
        document.getElementById('WatchUrl').value = movie.watch || '';



        // Load screenshots
        clearScreenshotsAndDownloadLinks();

        // Load screenshots
        if (movie.screenshots && movie.screenshots.length > 0) {
            movie.screenshots.forEach((url, index) => {
                if (index === 0) {
                    document.querySelector('input[name="screenshots[]"]').value = url;
                } else {
                    const div = document.createElement('div');
                    div.className = 'screenshot-item';
                    div.innerHTML = `
                        <input type="url" name="screenshots[]" value="${url}" placeholder="Screenshot URL">
                        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">Remove</button>
                    `;
                    document.getElementById('screenshotsList').appendChild(div);
                }
            });
        }





        // Load download links
        if (movie.downloadLinks && Object.keys(movie.downloadLinks).length > 0) {
            let first = true;
            for (const [quality, link] of Object.entries(movie.downloadLinks)) {
                if (first) {
                    document.querySelector('input[name="qualities[]"]').value = quality;
                    document.querySelector('input[name="downloadLinks[]"]').value = link;
                    first = false;
                } else {
                    const div = document.createElement('div');
                    div.className = 'download-link-item';
                    div.innerHTML = `
                        <input type="text" name="qualities[]" value="${quality}" placeholder="Quality (e.g., 1080p)">
                        <input type="url" name="downloadLinks[]" value="${link}" placeholder="Download Link">
                        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">Remove</button>
                    `;
                    document.getElementById('downloadLinksList').appendChild(div);
                }
            }
        };


        //Load Categories
        if (movie.category) {
            movie.category.forEach((category, index) => {
                if (index === 0) {
                    document.querySelector('input[name="categories[]"]').value = category;
                } else {
                    const div = document.createElement('div');
                    div.className = 'screenshot-item';  // Ideally, use a more appropriate class name like 'category-item'
                    div.innerHTML = `
                        <input type="text" name="categories[]" value="${category}" placeholder="Enter Category">
                        <button type="button" class="delete-btn" onclick="this.parentElement.remove()">Remove</button>
                    `;
                    document.getElementById('categoryList').appendChild(div);
                }
            });
        };
    } catch (error) {
        console.error('Error loading movie data:', error);
        alert('Error loading movie data: ' + error.message);
        closeMovieModal();
    }
}

// CRUD Operations
const movieForm = document.getElementById('movieForm');
if (movieForm) {
    movieForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get screenshots
        const screenshotInputs = document.querySelectorAll('input[name="screenshots[]"]');
        const screenshots = Array.from(screenshotInputs)
            .map(input => input.value)
            .filter(url => url.trim() !== '');

        //Get Categories
        const CategoriesInput = document.querySelectorAll('input[name="categories[]"]')
        const Categories = Array.from(CategoriesInput)
            .map(input => input.value.toLowerCase())
            .filter(category => category.trim() !== '')

        // Get download links
        const qualityInputs = document.querySelectorAll('input[name="qualities[]"]');
        const linkInputs = document.querySelectorAll('input[name="downloadLinks[]"]');
        const downloadLinks = {};
        qualityInputs.forEach((input, index) => {
            const quality = input.value.trim();
            const link = linkInputs[index].value.trim();
            if (quality && link) {
                downloadLinks[quality] = link;
            }
        });

        const movieData = {
            title: document.getElementById('title').value,
            year: parseInt(document.getElementById('year').value),
            category: Categories,
            rating: parseFloat(document.getElementById('rating').value) || null,
            description: document.getElementById('description').value || '',
            posterUrl: document.getElementById('posterUrl').value,
            screenshots: screenshots,
            downloadLinks: downloadLinks,
            watch: document.getElementById('WatchUrl').value,
            position: document.getElementById('dropdown').value,
        };


        try {
            const url = currentMovieId
                ? `${API_BASE_URL}/movies/${currentMovieId}`
                : `${API_BASE_URL}/movies`;

            const method = currentMovieId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movieData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            closeMovieModal();
            loadMovies();
            alert(currentMovieId ? 'Movie updated successfully!' : 'Movie added successfully!');
        } catch (error) {
            console.error('Error saving movie:', error);
            alert('Error saving movie: ' + error.message);
        }
    });
}

window.deleteMovie = async function (movieId) {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        loadMovies();
        alert('Movie deleted successfully!');
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('Error deleting movie: ' + error.message);
    }
}

window.editMovie = function (movieId) {
    console.log(`Id Is ${movieId}`)
    openMovieModal(movieId);
}

// Logout function
window.logout = function () {
    localStorage.removeItem('adminSession');
    window.location.href = 'index.html';
}

class AdminPanel {
    constructor() {
        this.totalVisitorsElement = document.getElementById('totalVisitors');
        this.moviesListElement = document.getElementById('moviesList');
        this.addMovieForm = document.getElementById('addMovieForm');

        this.init();
    }

    async init() {
        await this.fetchMovies();
        await this.fetchVisitorCount();
        this.setupEventListeners();
    }

    async fetchMovies() {
        try {
            const response = await fetch(`${API_BASE_URL}/movies`);
            const movies = await response.json();
            this.displayMovies(movies);
        } catch (error) {
            console.error('Error fetching movies:', error);
        }
    }

    async fetchVisitorCount() {
        try {
            const response = await fetch(`${API_BASE_URL}/visitors/count`);
            const data = await response.json();
            this.totalVisitorsElement.textContent = data.count;
        } catch (error) {
            console.error('Error fetching visitor count:', error);
        }
    }

    displayMovies(movies) {
        if (this.moviesListElement) {
            this.moviesListElement.innerHTML = ''; // Set innerHTML only if element exists
        }

        movies.forEach(movie => {
            const movieElement = document.createElement('div');
            movieElement.className = 'movie-item';
            movieElement.innerHTML = `
                <img src="${movie.posterUrl}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <p>Year: ${movie.year}</p>
                <p>Category: ${movie.category}</p>
                <div class="movie-actions">
                    <button onclick="adminPanel.editMovie('${movie._id}')">Edit</button>
                    <button onclick="adminPanel.deleteMovie('${movie._id}')">Delete</button>
                </div>
                <div class="movie-details">
                    <h4>Screenshots</h4>
                    <div class="screenshots-list" id="screenshots-${movie._id}">
                        ${this.renderScreenshots(movie.screenshots)}
                    </div>
                    <button onclick="adminPanel.addScreenshot('${movie._id}')">Add Screenshot</button>
                    
                    <h4>Quality Options</h4>
                    <div class="quality-options" id="quality-${movie._id}">
                        ${this.renderQualityOptions(movie.downloadLinks)}
                    </div>
                    <button onclick="adminPanel.addQualityOption('${movie._id}')">Add Quality Option</button>
                </div>
            `;
            this.moviesListElement.appendChild(movieElement);
        });
    }

    renderScreenshots(screenshots = []) {
        return screenshots.map(screenshot => `
            <div class="screenshot-item">
                <img src="${screenshot}" alt="Screenshot">
                <button onclick="adminPanel.deleteScreenshot('${screenshot}')">Delete</button>
            </div>
        `).join('');
    }

    renderQualityOptions(options = {}) {
        return Object.keys(options).map(quality => `
            <div class="quality-option">
                <span>${quality}</span>
                <button onclick="adminPanel.deleteQualityOption('${quality}')">Delete</button>
            </div>
        `).join('');
    }

    setupEventListeners() {
        this.addMovieForm.addEventListener('submit', (e) => this.handleAddMovie(e));
    }

    async handleAddMovie(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const movieData = {
            title: formData.get('title'),
            year: parseInt(formData.get('year')),
            category: formData.get('category'),
            posterUrl: formData.get('posterUrl')
        };

        try {
            const response = await fetch(`${API_BASE_URL}/movies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(movieData)
            });

            if (response.ok) {
                alert('Movie added successfully!');
                this.addMovieForm.reset();
                this.fetchMovies();
            } else {
                throw new Error('Failed to add movie');
            }
        } catch (error) {
            console.error('Error adding movie:', error);
            alert('Error adding movie');
        }
    }

    async deleteMovie(movieId) {
        if (!confirm('Are you sure you want to delete this movie?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/movies/${movieId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Movie deleted successfully!');
                this.fetchMovies();
            } else {
                throw new Error('Failed to delete movie');
            }
        } catch (error) {
            console.error('Error deleting movie:', error);
            alert('Error deleting movie');
        }
    }

    async addScreenshot(movieId) {
        const url = prompt('Enter screenshot URL:');
        if (!url) return;

        try {
            const response = await fetch(`${API_BASE_URL}/movies/${movieId}/screenshots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (response.ok) {
                alert('Screenshot added successfully!');
                this.fetchMovies();
            } else {
                throw new Error('Failed to add screenshot');
            }
        } catch (error) {
            console.error('Error adding screenshot:', error);
            alert('Error adding screenshot');
        }
    }

    async deleteScreenshot(screenshot) {
        if (!confirm('Are you sure you want to delete this screenshot?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/movies/screenshots`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ screenshot })
            });

            if (response.ok) {
                alert('Screenshot deleted successfully!');
                this.fetchMovies();
            } else {
                throw new Error('Failed to delete screenshot');
            }
        } catch (error) {
            console.error('Error deleting screenshot:', error);
            alert('Error deleting screenshot');
        }
    }

    async deleteQualityOption(quality) {
        if (!confirm(`Are you sure you want to delete the ${quality} quality option?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/movies/quality/${quality}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Quality option deleted successfully!');
                this.fetchMovies();
            } else {
                throw new Error('Failed to delete quality option');
            }
        } catch (error) {
            console.error('Error deleting quality option:', error);
            alert('Error deleting quality option');
        }
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();

// When rendering movie rows, add this structure
function renderMovieRow(movie) {
    return `
        <td class="movie-handle">☰</td>
        <td>${movie.sequence || 'N/A'}</td>
        <td>${movie.title}</td>
        <td>${movie.year}</td>
        <td>${movie.category ? movie.category.join(', ') : ''}</td>
        <td>${movie.rating || 'N/A'}</td>
        <td>${movie.position || 'None'}</td>
        <td>
            <button onclick="openMovieModal('${movie._id}')" class="action-btn edit-btn"><i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="deleteMovie('${movie._id}')" class="action-btn delete-btn"><i class="fa-solid fa-trash"></i></button>
        </td>
    `;
}

// Updated drag and drop implementation
function initializeDragAndDrop() {
    const tableBody = document.getElementById('movieTableBody');
    const rows = tableBody.getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        row.setAttribute('draggable', true);
        row.classList.add('movie-row');
        row.addEventListener('dragstart', handleDragStart);
        row.addEventListener('dragend', handleDragEnd);
        row.addEventListener('dragover', handleDragOver);
        row.addEventListener('drop', handleDrop);
    });
}

let draggedRow = null;

function handleDragStart(e) {
    draggedRow = e.target.closest('tr');
    draggedRow.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    draggedRow.classList.remove('dragging');
    draggedRow = null;

    // Remove drag-over class from all rows
    const rows = document.querySelectorAll('.movie-row');
    rows.forEach(row => row.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const row = e.target.closest('tr');
    if (row && row !== draggedRow) {
        // Remove drag-over class from all rows
        const rows = document.querySelectorAll('.movie-row');
        rows.forEach(r => r.classList.remove('drag-over'));

        // Add drag-over class to current row
        row.classList.add('drag-over');
    }
}

async function handleDrop(e) {
    e.preventDefault();
    const row = e.target.closest('tr');

    if (row && draggedRow && row !== draggedRow) {
        const rows = Array.from(document.querySelectorAll('.movie-row'));
        const fromIndex = rows.indexOf(draggedRow);
        const toIndex = rows.indexOf(row);

        // Reorder DOM elements
        if (fromIndex < toIndex) {
            row.parentNode.insertBefore(draggedRow, row.nextSibling);
        } else {
            row.parentNode.insertBefore(draggedRow, row);
        }

        // Update sequences in database
        await updateMovieSequences();
    }

    // Remove drag-over class
    row.classList.remove('drag-over');
}

async function updateMovieSequences() {
    try {
        const rows = Array.from(document.querySelectorAll('.movie-row'));
        const sequences = rows.map((row, index) => ({
            movieId: row.querySelector('.edit-btn').getAttribute('onclick').split("'")[1],
            sequence: index + 1
        }));

        const response = await fetch(`${API_BASE_URL}/movies/update-sequences`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sequences })
        });

        if (!response.ok) {
            throw new Error('Failed to update sequences');
        }

        // Refresh the movie list to show updated sequences
        await loadMovies();
    } catch (error) {
        console.error('Error updating sequences:', error);
        alert('Failed to update movie sequences. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => { initializeDragAndDrop(); });