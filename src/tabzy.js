const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function Tabzy(selector, options = {}) {
    this.container = document.querySelector(selector);
    this.selector = selector.replace(/[^a-zA-Z0-9]/g, "");

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

    this.opt = Object.assign(
        {
            remember: false,
        },
        options
    );

    this._originalHTML = this.container.innerHTML;

    this._init();
}

Tabzy.prototype._init = function () {
    const searchParams = new URLSearchParams(location.search);
    const tabSelector = searchParams.get(this.selector);

    const tabToActivate =
        (this.opt.remember &&
            tabSelector &&
            this.tabs.find(
                (tab) =>
                    tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "") ===
                    tabSelector
            )) ||
        this.tabs[0];
    this._activateTab(tabToActivate);

    // Event
    this.tabs.forEach(
        (tab) => (tab.onclick = (event) => this._handleTabClick(event, tab))
    );
};

Tabzy.prototype._handleTabClick = function (event, tab) {
    event.preventDefault();

    this._activateTab(tab);
};

Tabzy.prototype._activateTab = function (tab) {
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

    // searchParams
    if (this.opt.remember) {
        const params = new URLSearchParams(location.search);
        params.set(
            this.selector,
            tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "")
        );

        history.replaceState(null, null, `?${params}`);
    }
};

// input: panel selector or tab element
Tabzy.prototype.switch = function (input) {
    let tabToActivate = null;

    // 1. input: panel selector
    if (typeof input === "string") {
        tabToActivate = this.tabs.find(
            (tab) => tab.getAttribute("href") === input
        );

        if (!tabToActivate) {
            console.error(`Tabzy: No panel found with ID: "${input}"`);
            return;
        }
    }

    // 2.input: tab element
    else if (this.tabs.includes(input)) {
        tabToActivate = input;
    }

    if (!tabToActivate) {
        console.error(`Tabzy: Invalid input "${input}"`);
        return;
    }

    this._activateTab(tabToActivate);
};

Tabzy.prototype.destroy = function () {
    this.container.innerHTML = this._originalHTML;

    this.panels.forEach((panel) => (panel.hidden = false));
    this.container.closest(".container").classList.add("destroy");

    this.container = null;
    this.tabs = null;
    this.panels = null;
};
