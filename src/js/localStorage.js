import refs from './refs';

const moviesWatched = [];
const viewQueue = [];

refs.modalBoxRef.addEventListener('click', (e) => {
    if (e.target.classList.contains('js-btn-watched')) {

        moviesWatched.push({
            name: 'Охота наsdasdа',
            author: 'ddsadsa',
            genre: 'детектив',
            pageCount: 724,
            publisher: 'ООО Астрель',
        });

        localStorage.setItem('moviesWatched', convertToString(moviesWatched));
    }

   
    return moviesWatched;
});

refs.modalBoxRef.addEventListener('click', (e) => {

    if (e.target.classList.contains('js-btn-queue')) {
        viewQueue.push({
            name: 'Охота наsdasdа',
            author: 'ddsadsa',
            genre: 'детектив',
            pageCount: 724,
            publisher: 'ООО Астрель',
        });

        localStorage.setItem('viewQueue', convertToString(viewQueue));
    }

    return viewQueue;
});



function addToWatched(e, array) {
    if (e.target.classList.contains('js-btn-watched')) {
        console.log('aaaaaa');

        array.push({
            name: 'Охота на фазана',
            author: 'Марта Кэтра',
            genre: 'детектив',
            pageCount: 724,
            publisher: 'ООО Астрель',
        });

        console.log(localStorage.setItem('moviesWatched', convertToString(array)));
    }

    return
}

function convertToString(obj) {

    const string = JSON.stringify(obj);
    return string;  
};

function psrsedToElement(str) {
    const parsedElement = JSON.parse(str);
    return parsedElement;
}