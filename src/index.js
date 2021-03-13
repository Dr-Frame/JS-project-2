import './sass/styles.scss';
const _ = require('lodash');
import refs from './js/refs';
import apiFetch from './js/apiService.js';
import popularFilmsGalerryTpl from './templates/filmgallery.hbs';
import libraryPage from './templates/library.hbs';
import modalTpl from './templates/modal.hbs';
import './js/close-modal';
import './js/paginTowork';
import './js/paginJS';
import 'paginationjs';

//============== вставка Dr.Frame======================
//=====================================================

// мои ссылки для корректной работы впихнутого кода
const inputRef = refs.inputRef;
const galleryRef = refs.galleryRef;
const backdropRef = document.querySelector('#js-backdrop');
const paginationRef = document.querySelector('#pagination-container');

// берут значение после фетча
const resultData = {
  currentPage: 1,
  totalPages: null,
  totalResults: null,
  error: false,
};

//массив жанров от АПИ
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

//массив для хранения просмотренных фильмов (ЛокалСторадж)
let watchedMovies = [];

//массив для хранения фильмов в очереди (Локал сторадж)
let moviesInQueue = [];

//заходит сюда отрендеренный масив
let moviesArr;
//заходит обьект для рендера модалки
let currentFilmObj = {};

// ============================== старт приложения ============================
inputRef.addEventListener('input', _.debounce(handleSearchQuery, 1000));
galleryRef.addEventListener('click', modalMatchesFounder);
refs.libraryLinkRef.addEventListener('click', libraryPageRender);

getLocalStorageDataWatched();
getLocalStorageDataQueue();
startPopularFilms();

// =========================   функция отрисовки страницы библиотеки
function libraryPageRender() {
  refs.libraryInsertPlaceRef.innerHTML = '';
  paginationRef.innerHTML = '';
  galleryRef.innerHTML = '';
  libraryPageMarkupInsert();
}

//======================    функция рендерит Библиотку страницу
function libraryPageMarkupInsert() {
  const libraryMarkupTpl = libraryPage();
  refs.libraryInsertPlaceRef.insertAdjacentHTML('afterbegin', libraryMarkupTpl);
}

// ======================= LOCAL STORAGE =============
//watched
refs.libraryInsertPlaceRef.addEventListener('click', markupWatchedInject);
refs.modalBoxRef.addEventListener('click', containWatchedMoviesArr);
//queue
refs.libraryInsertPlaceRef.addEventListener('click', markupQueueInject);
refs.modalBoxRef.addEventListener('click', containQueueMoviesArr);

//================ функция отрисовки ПРОСМОТРЕННЫХ/
function markupWatchedInject(e) {
  if (e.target.classList.contains('js-btn-render-watched')) {
    const btnWatchACTIVE = document.querySelector('.js-btn-render-watched');
    const btnQueueOFF = document.querySelector('.js-btn-render-queue');
    btnQueueOFF.classList.remove('btn-active');
    btnWatchACTIVE.classList.add('btn-active');

    galleryRef.innerHTML = '';
    handlePopularFilmMarkup(watchedMovies);
  }
}

//================ функция отрисовки В ОЧЕРЕДИ/
function markupQueueInject(e) {
  if (e.target.classList.contains('js-btn-render-queue')) {
    const btnWatchOFF = document.querySelector('.js-btn-render-watched');
    const btnQueueACTIVE = document.querySelector('.js-btn-render-queue');
    btnQueueACTIVE.classList.add('btn-active');
    btnWatchOFF.classList.remove('btn-active');

    galleryRef.innerHTML = '';
    handlePopularFilmMarkup(moviesInQueue);
  }
  /* else if (moviesInQueue.length === 0) {
    refs.galContainerRef.firstElementChild.remove();
    const emptyQueue = `<div class="queue">
  <p class="queue-text">There is no film in queue! Add some </p>
  <a class="queue-link" href="./index.html"> movies</a>
</div>`;
    refs.galContainerRef.insertAdjacentHTML('afterbegin', emptyQueue);
  } */
}

// =============================  загрузка массива ПРОСМОТРЕННЫХ
function containWatchedMoviesArr(e) {
  if (e.target.classList.contains('js-btn-watched')) {
    filterUniqueWatchedQueue(watchedMovies, 'watchedMovies');
  }
}

// =============================  загрузка массива в ОЧЕРЕДИ
function containQueueMoviesArr(e) {
  if (e.target.classList.contains('js-btn-queue')) {
    filterUniqueWatchedQueue(moviesInQueue, 'moviesInQueue');
  }
}

// ==========================================отвечает за пуш обьекта в массив ПРОСМОТРЕННЫЕ,
// ПРОПУСКАЕТ  только уникальые, сохраняет локал сторадж
function filterUniqueWatchedQueue(arrayToFilter, localStorageKey) {
  let someTry = false;

  arrayToFilter.forEach((item, i) => {
    if (item.poster_path === currentFilmObj.poster_path) {
      someTry = true;
    }
  });

  if (someTry) {
    return;
  } else {
    arrayToFilter.push(currentFilmObj);
    localStorage.setItem(localStorageKey, convertToString(arrayToFilter));
  }
}

// отрисовка массива ПРОСМОТРЕННЫХ фильмов

// ======================================== превращает Обьект в строку
function convertToString(obj) {
  const string = JSON.stringify(obj);
  return string;
}

// =======================================  получить данные с локал стораджа WATCHED
function getLocalStorageDataWatched() {
  const string = localStorage.getItem('watchedMovies');

  if (string) {
    watchedMovies = parsedToElement(string);
  }
}

// =====================================  получить данные с локал стораджа QUEUE
function getLocalStorageDataQueue() {
  const string = localStorage.getItem('moviesInQueue');

  if (string) {
    moviesInQueue = parsedToElement(string);
  }
}

// ===================================парсит Строку в Обьект
function parsedToElement(str) {
  const parsedElement = JSON.parse(str);
  return parsedElement;
}

// ======================= LOCAL STORAGE \\\\\\\\\\\\\\\\\\\\\\\\\\

// ======================== ПАГИНАЦИЯ ===============================

function startPopularFilms() {
  resultData.error = false;
  refs.galleryRef.classList.remove('movie__list--error');
  paginationJsPopular();
}

function paginationJsPopular() {
  const trendingsUrl = apiFetch.trendingUrl;
  const trendingUrlApiKey = `${trendingsUrl}${apiFetch.apiKey}`;
  const galleryRef = refs.galleryRef;

  $('#pagination-container').pagination({
    dataSource: trendingUrlApiKey,
    locator: 'results',
    totalNumberLocator: data => data.total_results,
    pageSize: 20,
    alias: {
      pageNumber: 'page',
    },
    prevText: '',
    nextText: '',
    callback: function (data, pagination) {
      galleryRef.innerHTML = '';
      handlePopularFilmMarkup(genreTransform(data, genreDB));
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
  });
}

function handleSearchQuery(event) {
  paginationRef.classList.remove('pagination-is-hide');
  resultData.error = false;
  refs.galleryRef.classList.remove('movie__list--error');
  apiFetch.searchQuerry = '';
  apiFetch.searchQuerry = inputRef.value;

  if (inputRef.value) {
    galleryRef.innerHTML = '';
    paginationJsSearch();
  } else {
    galleryRef.innerHTML = '';
    startPopularFilms();
  }
}

function paginationJsSearch() {
  const searchUrl = apiFetch.searchUrl;
  const querry = apiFetch.searchQuerry;
  const searchUrlApiKey = `${searchUrl}${apiFetch.apiKey}&query=${querry}`;
  const galleryRef = refs.galleryRef;

  $('#pagination-container').pagination({
    dataSource: searchUrlApiKey,
    locator: 'results',
    totalNumberLocator: data => data.total_results,
    pageSize: 20,
    alias: {
      pageNumber: 'page',
    },
    prevText: '',
    nextText: '',
    callback: function (data, pagination) {
      if (data.length === 0) {
        failureMarkup(galleryRef);
        paginationRef.classList.add('pagination-is-hide');
      } else {
        galleryRef.innerHTML = '';
        handlePopularFilmMarkup(genreTransform(data, genreDB));
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    },
  });
}

// ======================== ******* ПАГИНАЦИЯ ********* =============================== \\\\\\

//================================== меняет числа жанров на название и дату релиза
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
  console.log(moviesArr);
  return transferedGenreArr;
}

//================================= ставит разметку популярных фильмов
function handlePopularFilmMarkup(popularFilms) {
  const popularMarkup = popularFilmsGalerryTpl(popularFilms);
  galleryRef.insertAdjacentHTML('beforeend', popularMarkup);
}

// =================================================================================================

//===============================  функции отвечающие за отрисовку запроса

// рисует разметку когда нету результатов запроса
function failureMarkup(placeToInsert) {
  resultData.error = true;
  refs.galleryRef.classList.add('movie__list--error');
  const failureMarkup = `<div class="error">
  <div class="error-img"><img class="js-img-error" src="https://i.ibb.co/4WvT00q/caterror.jpg" alt="" width="300"></div>

  <p class="gallery__failure"> Unfortunately, no matches found. <span>Try again!</span> </p>
</div>`;
  placeToInsert.insertAdjacentHTML('afterbegin', failureMarkup);
}

// =================== модалка вывод фильма по клику =======================================

function modalMatchesFounder(event) {
  console.log(event.target);
  if (
    event.target.nodeName !== 'IMG' ||
    event.target.classList.contains('js-img-error')
  ) {
    return;
  }
  //вызов рендеринга модалки
  const toMatch = event.target.dataset.compare;

  moviesArr.forEach(item => {
    if (item.poster_path === toMatch) {
      console.log(item);
      currentFilmObj = { ...item };
    } else {
      return;
    }
  });
  handleModalMarkup(currentFilmObj);
  backdropRef.classList.remove('is-hidden');
  console.log(currentFilmObj);
}

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
  movie.genre_ids = genreArr;
  console.log(movie);
  return movie;
}

//рендерит разметку модального окна
function handleModalMarkup(currentMovie) {
  const modalMarkup = modalTpl(currentMovie);
  refs.modalBoxRef.insertAdjacentHTML('afterbegin', modalMarkup);
}

// ======================== конец кода  Dr.Frame  =============================================
//==================================================================================
