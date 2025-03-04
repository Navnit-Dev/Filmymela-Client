

class Watchlist {
  constructor(JWT, UserId) {
    this.user = JWT; // User object (null if not logged in)
    this.userId = UserId || null; // Extract user ID
    this.footer = document.querySelector(".mobile-footer");

    this.movies = [];
    this.IdList = [];

    this.Initialize();
    this.FetchList();
    this.SetListeners();
    this.init();
  }

  init() {
    this.renderFooter();
    this.addEventListeners();
  }

  renderFooter() {
    // Clear previous content to avoid duplication
    this.footer.innerHTML = "";

    // Create Home Button
    const homeBtn = this.createNavButton("fa-home", "Home", "./index.html");
    this.footer.appendChild(homeBtn);

    // Create Watchlist Button
    const watchlistBtn = this.createNavButton(
      "fa-heart",
      "Watchlist",
      "./watchlist.html"
    );
    this.footer.appendChild(watchlistBtn);

    // Create Profile/Login Button
    let userBtn;
    if (this.user) {
      // User is logged in - Show Profile Button
      userBtn = this.createNavButton(
        "fa-user",
        "Profile",
        `./profile.html?userId=${this.userId}`
      );
    } else {
      // User is not logged in - Show Login Button
      userBtn = this.createNavButton("fa-sign-in-alt", "Login", "#");
      userBtn.classList.add("login-btn");
    }
    this.footer.appendChild(userBtn);
  }

  createNavButton(iconClass, text, link) {
    const button = document.createElement("button");
    button.classList.add("nav-btn");
    button.onclick = () => (window.location.href = link);

    const icon = document.createElement("i");
    icon.classList.add("fas", iconClass);

    const span = document.createElement("span");
    span.innerText = text;

    button.appendChild(icon);
    button.appendChild(span);

    return button;
  }

  addEventListeners() {
    const loginBtn = this.footer.querySelector(".login-btn");
    if (loginBtn) {
      loginBtn.addEventListener("click", () => {
        window.location.href = "./UserLogin.html";
      });
    }
  }

  //Start All Elements
  Initialize() {
    this.movieList = document.getElementById("movie-list");
    this.searchInput = document.getElementById("search");
    this.NoMovieMsg = document.getElementById('NoMovie');
  };

  //Start Listeners

  SetListeners() {
    this.searchInput.addEventListener('input',()=> this.search())}


    search() {
        const searchValue = this.searchInput.value.toLowerCase();

        const Filtered = this.movies.filter(movie => 
            movie.title.toLowerCase().includes(searchValue) // Corrected filter condition
        );

        this.LoadMovies(Filtered);
    }

  async FetchList() {
    try {
      const response = await fetch(
        `http://localhost:8001/api/watchlist/${this.userId}`
      );
      const data = await response.json();

      if (!response.ok) {
        window.location.href = '/'
      }

      if(data.movieIds.length == 0){
        this.NoMovieMsg.style.display = 'block';
      } else {
        const Ids = data.movieIds;
      this.IdList  = data.movieIds;
      try {
        const response = await fetch("http://localhost:8001/api/get-movies", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ movieIds: Ids }),
        });
        this.movies = await response.json();
        console.log(this.movies);
        this.LoadMovies(this.movies.reverse(), this.searchInput.value);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
      }

      

    } catch (error) {
      console.log(error);
    }
  }

  LoadMovies(Movies) {
    this.movieList.innerHTML = ' ';
    Movies.map((Movie) => {
      const movieItem = document.createElement("div");
      movieItem.classList.add("movie");
      movieItem.setAttribute("data-id", Movie.id);
      movieItem.draggable = true;
      movieItem.innerHTML = `
                            <img src="${Movie.posterUrl}" alt="${Movie.title}">
                            <div class="Movie-info">
                                    <h4>${Movie.title}</h4>
                                    <p>${Movie.description}</p>
                                    <small>⭐ ${Movie.rating} | ${Movie.categories}</small>
                                </div>
                                <button class="remove-btn"><i class="fa fa-trash"></i></button>
                            `;
      movieItem.addEventListener("click", () => {
        window.location.href = `./movie.html?id=${Movie._id}`;
      });
      movieItem.querySelector('.remove-btn').addEventListener('click',(e)=>{
        e.stopPropagation();
        this.removeMovie(this.userId,Movie._id)
      })
      
      this.movieList.appendChild(movieItem);
    });
  }

 async removeMovie  (UserId,movieId)  {
    const Deletemodel = {
        userId:UserId,
        movieId:movieId
    }

    try { 
        const response = await fetch('http://localhost:8001/api/remove-from-watchlist',{
            method:"POST",
            headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(Deletemodel),

        })
        const data =  await response.json();

        if(!response.ok){
            this.ErrorNotify(movieId)
        }
        this.SuccessNotify(movieId);
        this.IdList = data.updatedWatchlist.movieIds;
        location.reload();


        
    } catch (error) {
        console.log(error)
    }

    
}




async SuccessNotify(movieId){
    toastr.options = {
        closeButton: true,
        progressBar: true,
        timeOut: "3000", // Auto-close after 3 seconds
        extendedTimeOut: "1000",
        positionClass: "toast-top-right", // Change position
      };

      const response = await fetch(`http://localhost:8001/api/movies/${movieId}`);
      const data = await response.json();

      toastr.success('Movie Added Successfully !',`${data.title}`)
      
  }

  async ErrorNotify(movieId){
    toastr.options = {
        closeButton: true,
        progressBar: true,
        timeOut: "3000", // Auto-close after 3 seconds
        extendedTimeOut: "1000",
        positionClass: "toast-top-right", // Change position
      };

      const response = await fetch(`http://localhost:8001/api/movies/${movieId}`);
      const data = await response.json();

      toastr.error('Cannot Delete !',`${data.title}`)
      
  }



}




document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("user"); // Get token from storage
  const UserId = localStorage.getItem("id") || null;
  let tokenId = null;

  if (token) {
    try {
      tokenId = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("tokenId"); // Clear corrupted token
    }
  }

  new Watchlist(tokenId, UserId);

  // Replace login button with profile button if user is authenticated
  const loginBtn = document.getElementById("loginBtn");
  if (tokenId && loginBtn) {
    loginBtn.outerHTML = `<button id="profileBtn">👤 Profile</button>`;
  }
  console.log(UserId);
});
