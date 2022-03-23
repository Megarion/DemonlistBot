// @ts-check

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const type = urlParams.get('type');
const id = urlParams.get('id');

let fetchURL;

function redirect(url) {
    window.location.replace(url);
}

switch (type) {
    case "demon":
        fetchURL = `https://pointercrate.com/api/v2/demons/${id}`;
        fetch(fetchURL)
            .then(response => response.json())
            .then(data => redirect(`https://pointercrate.com/demonlist/${data.data.position}`));
        break;

    default:
        break;
}