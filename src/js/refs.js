const refs = {
  inputRef: document.querySelector('.search-form'),
  galleryRef: document.querySelector('.movie__list'),
  modalRef: document.querySelector('.card'),
  modalBoxRef: document.querySelector('.card-box'),
  galContainerRef: document.querySelector('.js-container'),
  prevBtnRef: document.querySelector('#js-prev-btn'),
  nextBtnRef: document.querySelector('#js-next-btn'),
  btnCloseModalRef: document.querySelector('.card__btn-close'),
  modalBackdropRef: document.querySelector('.backdrop'),
  paginBtnsRef: document.querySelectorAll('.pagination__page-btn'),
  paginBtnWrapper: document.querySelector('.pagination__page-numbers'),
  libraryLinkRef: document.querySelector('.js-library'),
  libraryInsertPlaceRef: document.querySelector('.my-library')
};

export default refs;
