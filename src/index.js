import './sass/styles.scss';
const _ = require('lodash');
import refs from './js/refs';
import apiFetch from './js/apiService.js';
import popularFilmsGalerryTpl from './templates/filmgallery.hbs';
import libraryPage from './templates/library.hbs';
import modalTpl from './templates/modal.hbs';
import './js/close-modal';
import './js/paginTowork';

//============== вставка Dr.Frame======================
//=====================================================

// мои ссылки для корректной работы впихнутого кода
const inputRef = refs.inputRef;
const galleryRef = refs.galleryRef;
const backdropRef = document.querySelector('#js-backdrop');
/* const paginationContainer = document.querySelector('.pagination'); */
const element = document.querySelector('.pagination ul');

// берут значение после фетча
const resultData = {
  currentPage: 1,
  totalPages: null,
  totalResults: null,
  error: false,
};

let totalPages = 100;
let page = 5;

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

// ======================== ПАГИНАЦИЯ ===============================

console.log(refs.paginBtnsRef);
refs.prevBtnRef.addEventListener('click', handleBtnPrevClick);
refs.nextBtnRef.addEventListener('click', handleBtnNextClick);

refs.paginBtnWrapper.addEventListener('click', event => {
  if (event.target.nodeName === 'BUTTON') {
    const pageToRender = event.target.textContent;
    apiFetch.page = Number(pageToRender);
    console.log(pageToRender);

    if (apiFetch.searchQuerry) {
      handleBtnClickSearchQuery();
    } else {
      galleryRef.innerHTML = '';
      startPopularFilms();
    }
  }
});

//==============================    функция стрелки НАЗАД
function handleBtnPrevClick() {
  if (apiFetch.page === 1 || resultData.error) {
    return;
  } else if (inputRef.value) {
    galleryRef.innerHTML = '';
    apiFetch.page -= 1;
    handleBtnClickSearchQuery();
    return;
  } else {
    galleryRef.innerHTML = '';
    apiFetch.page -= 1;

    console.log(apiFetch.page);
    startPopularFilms();
  }
}

//===============================   функция стрелки ВПЕРЕД
function handleBtnNextClick() {
  console.log(resultData.totalPages);
  if (apiFetch.page === resultData.totalPages || resultData.error) {
    return;
  } else if (inputRef.value) {
    galleryRef.innerHTML = '';
    apiFetch.page += 1;
    handleBtnClickSearchQuery();
    return;
  } else {
    galleryRef.innerHTML = '';
    apiFetch.page += 1;

    console.log(apiFetch.page);
    startPopularFilms();
  }
}

//чужой код с пагинацие
function createPagination(totalPages, page) {
  console.log(totalPages);
  console.log(page);
  let liTag = '';
  let active;
  let beforePage = page - 1;
  let afterPage = page + 1;
  if (page > 1) {
    //show the next button if the page value is greater than 1
    liTag += `<li class="btn prev" onclick="createPagination(totalPages, ${
      page - 1
    })"><span><i class="fas fa-angle-left"></i> Prev</span></li>`;
  }

  if (page > 2) {
    //if page value is less than 2 then add 1 after the previous button
    liTag += `<li class="first numb" onclick="createPagination(totalPages, 1)"><span>1</span></li>`;
    if (page > 3) {
      //if page value is greater than 3 then add this (...) after the first li or page
      liTag += `<li class="dots"><span>...</span></li>`;
    }
  }

  // how many pages or li show before the current li
  if (page == totalPages) {
    beforePage = beforePage - 2;
  } else if (page == totalPages - 1) {
    beforePage = beforePage - 1;
  }
  // how many pages or li show after the current li
  if (page == 1) {
    afterPage = afterPage + 2;
  } else if (page == 2) {
    afterPage = afterPage + 1;
  }

  for (var plength = beforePage; plength <= afterPage; plength++) {
    if (plength > totalPages) {
      //if plength is greater than totalPage length then continue
      continue;
    }
    if (plength == 0) {
      //if plength is 0 than add +1 in plength value
      plength = plength + 1;
    }
    if (page == plength) {
      //if page is equal to plength than assign active string in the active variable
      active = 'active';
    } else {
      //else leave empty to the active variable
      active = '';
    }
    liTag += `<li class="numb ${active}" onclick="createPagination(totalPages, ${plength})"><span>${plength}</span></li>`;
  }

  if (page < totalPages - 1) {
    //if page value is less than totalPage value by -1 then show the last li or page
    if (page < totalPages - 2) {
      //if page value is less than totalPage value by -2 then add this (...) before the last li or page
      liTag += `<li class="dots"><span>...</span></li>`;
    }
    liTag += `<li class="last numb" onclick="createPagination(totalPages, ${totalPages})"><span>${totalPages}</span></li>`;
  }

  if (page < totalPages) {
    //show the next button if the page value is less than totalPage(20)
    liTag += `<li class="btn next" onclick="createPagination(totalPages, ${
      page + 1
    })"><span>Next <i class="fas fa-angle-right"></i></span></li>`;
  }
  element.innerHTML = liTag; //add li tag inside ul tag
  return liTag; //reurn the li tag
}
// ======================== ******* ПАГИНАЦИЯ ********* =============================== \\\\\\

// ============================== старт приложения ============================

getLocalStorageDataWatched();
getLocalStorageDataQueue();
startPopularFilms();

//==== вызов чужой пагинации
/* element.innerHTML = createPagination(totalPages, page); */
//===============
inputRef.addEventListener('input', _.debounce(handleSearchQuery, 1000));

galleryRef.addEventListener('click', modalMatchesFounder);

refs.libraryLinkRef.addEventListener('click', libraryPageRender);

// ============= функции отвечает за стартовую загрузку популярных фильмов =============================

// =========================   функция отрисовки страницы библиотеки
function libraryPageRender() {
  refs.libraryInsertPlaceRef.innerHTML = '';
  galleryRef.innerHTML = '';
  libraryPageMarkupInsert();
}

//======================    функция рендерит Библиотку страницу
function libraryPageMarkupInsert() {
  const libraryMarkupTpl = libraryPage();
  refs.libraryInsertPlaceRef.insertAdjacentHTML('afterbegin', libraryMarkupTpl);
}

function dishargeCurPage() {
  apiFetch.resetPage();
}

// ============================= функция отрисовки популярных фильмов на странице
function startPopularFilms() {
  resultData.error = false;
  refs.galleryRef.classList.remove('movie__list--error');
  apiFetch
    .fetchPopularMovieGallery()
    .then(data => {
      resultData.currentPage = data.page;
      resultData.totalPages = data.total_pages;
      resultData.totalResults = data.total_results;
      totalPages = resultData.totalPages;
      page = resultData.currentPage;
      console.log(resultData.currentPage);
      console.log(resultData.totalPages);
      console.log(totalPages);
      console.log(page);
      return data;
    })
    .then(({ results }) => {
      console.log(apiFetch.page);
      handlePopularFilmMarkup(genreTransform(results, genreDB));
    });
}

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
function handleSearchQuery(event) {
  dishargeCurPage();
  resultData.error = false;
  refs.galleryRef.classList.remove('movie__list--error');
  apiFetch.searchQuerry = '';
  apiFetch.searchQuerry = inputRef.value;
  console.log(apiFetch.page);
  if (event.target.value) {
    galleryRef.innerHTML = '';
    apiFetch
      .fetchSearchRequestGallery()
      .then(data => {
        console.log(data);
        resultData.currentPage = data.page;
        resultData.totalPages = data.total_pages;
        resultData.totalResults = data.total_results;
        return data;
      })
      .then(({ results }) => {
        if (results.length === 0) {
          failureMarkup(refs.galleryRef);
        } else {
          handlePopularFilmMarkup(genreTransform(results, genreDB));
        }
      })
      .catch(error => console.log(error));
  } else {
    galleryRef.innerHTML = '';
    startPopularFilms();
  }
}

//функция рендера поискового запроса, при клике НА КНОПКУ
function handleBtnClickSearchQuery() {
  galleryRef.innerHTML = '';
  apiFetch
    .fetchSearchRequestGallery()
    .then(data => {
      resultData.currentPage = data.page;
      resultData.totalPages = data.total_pages;
      resultData.totalResults = data.total_results;
      return data;
    })
    .then(({ results }) => {
      if (results.length === 0) {
        failureMarkup(refs.galleryRef);
      } else {
        handlePopularFilmMarkup(genreTransform(results, genreDB));
      }
    })
    .catch(error => console.log(error));
}

// рисует разметку когда нету результатов запроса
function failureMarkup(placeToInsert) {
  resultData.error = true;
  refs.galleryRef.classList.add('movie__list--error');
  const failureMarkup = `<div class="error">
  <div class="error-img"><img src="https://i.ibb.co/4WvT00q/caterror.jpg" alt="" width="300"></div>

  <p class="gallery__failure"> Unfortunately, no matches found. <span>Try again!</span> </p>
</div>`;
  placeToInsert.insertAdjacentHTML('afterbegin', failureMarkup);
}

// =================== модалка вывод фильма по клику =======================================

function modalMatchesFounder(event) {
  if (event.target.nodeName !== 'IMG') {
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
    galleryRef.innerHTML = '';
    handlePopularFilmMarkup(watchedMovies);
  }
}

//================ функция отрисовки В ОЧЕРЕДИ/
function markupQueueInject(e) {
  if (e.target.classList.contains('js-btn-render-queue')) {
    galleryRef.innerHTML = '';
    handlePopularFilmMarkup(moviesInQueue);
  }
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

// ======================== конец кода  Dr.Frame  =============================================
//==================================================================================
