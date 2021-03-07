import './sass/styles.scss';
const _ = require('lodash');
import apiFetch from './js/apiService.js';
import popularFilmsGalerryTpl from './templates/filmgallery.hbs';
import modalTpl from './templates/modal.hbs';

const inputRef = document.querySelector('#js-input');
const galleryRef = document.querySelector('#js-gallery');
const modalRef = document.querySelector('.modal');
const backdropRef = document.querySelector('#js-backdrop');
const prevBtnRef = document.querySelector('#js-prev-btn');
const nextBtnRef = document.querySelector('#js-next-btn');

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

//заходит сюда отрендеренный масив
let moviesArr;
//заходит обьект для рендера модалки
let currentFilmObj = {};

inputRef.addEventListener('input', _.debounce(handleSearchQuery, 700));

startPopularFilms();

// ============= фнкции отвечает за стартовую загрузку популярных фильмов =============================

// берут значение после фетча
let currentPage = 1;
let totalPages;
let totalResults;

function startPopularFilms() {
  apiFetch
    .fetchPopularMovieGallery()
    .then(data => {
      currentPage = data.page;
      totalPages = data.total_pages;
      totalResults = data.total_results;
      return data;
    })
    .then(({ results }) => {
      handlePopularFilmMarkup(genreTransform(results, genreDB));
    });
}

// меняет числа жанров на название и дату релиза
function genreTransform(moviesDB, genreDB) {
  const transferedGenreArr = moviesDB.map(film => {
    //ставим заглушку если нету фото
    if (film.poster_path === null) {
      film.poster_path = 'https://i.ibb.co/hWJT4yj/noImage.jpg';
    } else {
      const newPosterPath = `https://image.tmdb.org/t/p/w500/${film.poster_path}`;
      film.poster_path = newPosterPath;
    }

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
  moviesArr = transferedGenreArr;
  return transferedGenreArr;
}

//ставит разметку популярных фильмов
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
// =================================================================================================

//функции отвечающие за отрисовку запроса
function handleSearchQuery(event) {
  apiFetch.searchQuerry = '';
  apiFetch.searchQuerry = event.target.value;
  if (event.target.value) {
    galleryRef.innerHTML = '';
    apiFetch
      .fetchSearchRequestGallery()
      .then(data => {
        currentPage = data.page;
        totalPages = data.total_pages;
        totalResults = data.total_results;
        return data;
      })
      .then(({ results }) => {
        console.log(results);
        if (results.length === 0) {
          failureMarkup(galleryRef);
        } else {
          handlePopularFilmMarkup(genreTransform(results, genreDB));
        }
      })
      .catch(error => console.log(error));
  } else {
    return;
  }
  inputRef.value = '';
  console.log(apiFetch.searchQuerry);
}

// рисует разметку когда нету результатов запроса
function failureMarkup(placeToInsert) {
  const failureMarkup = `<div class="error">
  <img src="https://i.ibb.co/4WvT00q/caterror.jpg" alt="" width="500">
  <p class="gallery__failure"> Unfortunately, no matches found. <span>Try again!</span> </p>
</div>`;
  placeToInsert.insertAdjacentHTML('afterbegin', failureMarkup);
}

/* $('#pagination-container').pagination({
    dataSource: [1, 2, 3, 4, 5, 6, 7, ... , 195],
    callback: function(data, pagination) {
        // template method of yourself
        var html = template(data);
        $('#data-container').html(html);
    }
})
 */

let testObject = {
  adult: false,
  backdrop_path: '/69rb6VKOEqpuJ88MkKXLaSd71Va.jpg',
  genre_ids: [99, 28, 12],
  id: 299969,
  original_language: 'en',
  original_title: 'Marvel: 75 Years, From Pulp to Pop!',
  overview:
    "In celebration of the publisher's 75th anniversary, the hour-long special will take a detailed look at the company's journey from fledgling comics publisher to multi-media juggernaut. Hosted by Emily VanCamp (S.H.I.E.L.D. Agent Sharon Carter), the documentary-style feature will include interviews with comic book icons, pop culture authorities, and Hollywood stars.  The special also promises an extraordinary peek into Marvel's future! Might Marvel release the first official footage from next year's Avengers: Age of Ultron or Ant-Man? If they do, you'll know about it here.",
  popularity: 9.273,
  poster_path:
    'https://image.tmdb.org/t/p/w500//qNC8co8LuGBv22Fu9SC71ppAwoA.jpg',
  release_date: '2014-11-04',
  title: 'Marvel: 75 Years, From Pulp to Pop!',
  video: false,
  vote_average: 6.9,
  vote_count: 48,
};

galleryRef.addEventListener('click', modalMatchesFounder);

function modalMatchesFounder(event) {
  if (event.target.nodeName !== 'IMG') {
    return;
  }
  //вызов рендеринга модалки
  const toMatch = event.target.dataset.compare;
  console.log(moviesArr);
  moviesArr.forEach((item, i) => {
    if (item.poster_path === toMatch) {
      console.log(i);
      console.log('succes');
      console.log(item);
      console.log(currentFilmObj);
      currentFilmObj = { ...item };
      console.log(currentFilmObj);
      console.log(currentFilmObj.genre_ids.length);
      console.log(currentFilmObj.genre_ids[0]);
    }
  });
  handleModalMarkup(modalGenreEditor(currentFilmObj, genreDB));
  backdropRef.classList.remove('is-hidden');
}
/* 
function modalMatchesFounder(event) {
  if (event.target.nodeName !== 'IMG') {
    return;
  }
  //вызов рендеринга модалки
  const toMatch = event.target.dataset.compare;

  moviesArr.forEach(item => {
    if (item.poster_path === toMatch) {
      currentFilmObj = { ...item };
    } else {
      return;
    }
  });
  handleModalMarkup(modalGenreEditor(currentFilmObj, genreDB));
  backdropRef.classList.remove('is-hidden');
} */

//изменяет жанр при рендере модалки
function modalGenreEditor(movie, genreDB) {
  //изменяем жанр
  let genreArr = [];
  movie.genre_ids.forEach(genreId => {
    for (const genre of genreDB) {
      if (genre.id === genreId) {
        genreArr.push(genre.name);
      }
    }
  });
  movie.genre_ids = [...genreArr];
  return movie;
}

//рендерит разметку модального окна
function handleModalMarkup(currentMovie) {
  const modalMarkup = modalTpl(currentMovie);
  modalRef.insertAdjacentHTML('afterbegin', modalMarkup);
}
