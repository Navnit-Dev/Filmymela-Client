class MovieDetails {
    constructor () {
        this.movieId = new URLSearchParams(window.location.search).get('id');
        if (!this.movieId) {
            window.location.href = '/';
            return;
        }

        this.initialzeElements();
        this.LoadMovieDetails();
    };

    initialzeElements(){
        this.titleElement = document.getElementById('MovieName');
        this.DescriptionElement = document.getElementById('Description');
        this.GenreListElement = document.getElementById('GenreList');
        this.RateElement = document.getElementById('rate');
        this.DownloadListElement = document.getElementById('downloadList');
        this.DescriptionElement = document.getElementById('Description');
        this.DescriptionElement = document.getElementById('Description');
        this.DescriptionElement = document.getElementById('Description');
        this.FrameElement = document.getElementById('Frame');
        //Api Url
        this.Url = 'http://localhost:8001/api';

    };

    async LoadMovieDetails(){
        try {
            const response = await fetch( `${this.Url}/movies/${this.movieId}`)

            if(!response.ok){
                alert('Server Error! Movie Not Found')
                window.location.href  = '/'
            }

            const Movies = await response.json()
            this.loadUi(Movies)
            
        } catch (error) {
            console.error('Error loading movie details:', error);
            this.showError('Failed to load movie details');
        }
    }

    loadUi(MovieData){
        this.FrameElement.setAttribute('src',MovieData.watch);
        this.titleElement.innerText = MovieData.title;
        this.DescriptionElement.innerText = MovieData.description;
        //Handle Genre
        this.GenreListElement.innerHTML = ''
        MovieData.category.forEach(element => {
            let span = document.createElement('span');
            span.innerText = element.toUpperCase();
            this.GenreListElement.appendChild(span);
        });
        
        //Handle Rating
        this.RateElement.innerText = MovieData.rating;

        //Handle DowloadLinks
        this.DownloadListElement.innerHTML = '';
        Object.entries(MovieData.downloadLinks || {}).forEach(([quality, link]) => {
            const button = document.createElement('div');
            button.classList.add('links')
            button.target = '_blank';
            button.innerHTML = `
                <a href="${link}">${quality}  <i class="fas fa-download"></i></a>
            `;
            this.DownloadListElement.appendChild(button);
        });
    }


}


// Initialize the movie details page
document.addEventListener('DOMContentLoaded', () => {
    new MovieDetails();
});


