import './sass/styles.scss';
const _ = require('lodash');
import apiFetch from './js/apiService.js';
import popularFilmsGalerryTpl from './templates/filmgallery.hbs';

let genreDB = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const inputRef = document.querySelector('#js-input');
const galleryRef = document.querySelector('#js-gallery');

//inputRef.addEventListener('input', _.debounce(handleSearchQuery, 700));

startPopularFilms();

// ============= фнкции отвечает за стартовую загрузку популярных фильмов

function startPopularFilms() {
  apiFetch.fetchPopularMovieGallery().then(data => {
    handlePopularFilmMarkup(genreTransform(data, genreDB));
  });
}

// меняет числа жанров на название и дату релиза
function genreTransform(moviesDB, genreDB) {
  const transferedGenreArr = moviesDB.map(film => {
    //изменяем дату
    const newDate = film.release_date.slice(0, 4);

    //изменяем жанр
    let genreArr = [];
    film.genre_ids.forEach(genreId => {
      for (const genre of genreDB) {
        if (genre.id === genreId) {
          genreArr.push(genre.name);
        }
      }
    });
    return { ...film, genre_ids: genreArr, release_date: newDate };
  });
  return transferedGenreArr;
}

function handlePopularFilmMarkup(popularFilms) {
  const popularMarkup = popularFilmsGalerryTpl(popularFilms);
  galleryRef.insertAdjacentHTML('beforeend', popularMarkup);
}

// пока не нужно, база айди как масив обьектов константа
/* function genreDBFetch() {
  apiFetch.fetchGenresList().then(({ genres }) => {
    genreDB = genres;
  });
} */
// =========================================================================

//функции отвечающие за отрисовку запроса
/* function handleSearchQuery(event) {
  apiFetch.searchQuerry = event.target.value;
  if (event.target.value) {
    apiFetch.fetchSearchRequestGallery().then(data => console.log(data));
  } else {
    return;
  }
} */
