// @ts-check
// No JQuery? 🧐
class Item {
    constructor(version /* [1, 0, 0]] */, date /* [DD,MM,YYYY]] */, changes /* [change, change, change] */) {
        this.version = version.join('.');
        this.date = date.join('/');
        this.changes = "- " + changes.join('<br>- ');
    }

    html() {
        return `
            <span>
                <span class="pop">
                    <h1>${this.version}</h1>
                </span>
                <h2>${this.date}</h2>
                <p>${this.changes}</p>
            </span>
        `;
    }
};

let changelog = [
    new Item([1, 0, 1], [11, 4, 2022], [
        "Added searching by name! (for demoninfo and playerinfo)",
        "Fixed Error 400 (pointercrate)",
    ]),
    new Item([1, 0, 0], [10, 4, 2022], [
        "<strong>7 commands:</strong> demoninfo, demonlist, demonrecord, help, playerinfo, playerlist, playerrecord",
        "Information taken from Pointercrate API and GDBrowser API",
    ])
];

document.getElementById('changelog').innerHTML = changelog.map(item => item.html()).join("<span class='line'></span>");