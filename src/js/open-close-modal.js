import refs from './refs';

function closeModal() {
    
    refs.modalBackdropRef.classList.toggle('is-hidden');
    refs.modalBoxRef.innerHTML = '';
};

refs.btnCloseModalRef.addEventListener('click', closeModal);
refs.modalBackdropRef.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeModal();
    };
})
window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && !refs.modalBackdropRef.classList.contains('is-hidden')) {
        closeModal();
        console.log('adasd');
    };
});