const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function Tabzy(selector) {
    this.container = document.querySelector(selector);

    if (!this.container) {
        console.error(`Tabzy: No container found for selector: '${selector}'`);
        return;
    }
    this.tabs = Array.from(this.container.querySelectorAll("li a"));

    if (!this.tabs.length) {
        console.error("Tabzy: No tasks found inside in the container!");
        return;
    }

    this.panels = this.tabs
        .map((tab) => {
            const panel = document.querySelector(tab.getAttribute("href"));

            if (!panel) {
                console.error(
                    `No Panel found for selector '${tab.getAttribute("href")}'`
                );
                return;
            }
            return panel;
        })
        .filter(Boolean);

    if (this.panels.length !== this.tabs.length) return;

    this._init();
}

Tabzy.prototype._init = function () {
    const tabActive = this.tabs[0];
    tabActive.closest("li").classList.add("active");

    this.panels.forEach((panel) => (panel.hidden = true));

    const panelActive = this.panels[0];
    panelActive.hidden = false;

    // Event
    this.tabs.forEach(
        (tab) => (tab.onclick = (event) => this._handleTabClick(event, tab))
    );
};

Tabzy.prototype._handleTabClick = function (event, tab) {
    event.preventDefault();

    this.tabs.forEach((tab) => tab.closest("li").classList.remove("active"));
    tab.closest("li").classList.add("active");

    this.panels.forEach((panel) => {
        panel.hidden = true;
        panel.classList.remove("active");
    });

    // panel
    const panelActive = document.querySelector(tab.getAttribute("href"));
    panelActive.hidden = false;
    panelActive.classList.add("active");
};
