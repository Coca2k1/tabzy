const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function Tabzy(selector, options = {}) {
    this.container = document.querySelector(selector);
    this.selector = this._cleanRegex(selector);

    if (!this.container) {
        console.error(`Tabzy: No container found for selector: '${selector}'`);
        return;
    }
    this.tabs = Array.from(this.container.querySelectorAll("li a"));

    if (!this.tabs.length) {
        console.error("Tabzy: No tasks found inside in the container!");
        return;
    }

    this.panels = this.getPanels();

    if (this.panels.length !== this.tabs.length) return;

    this.opt = Object.assign(
        {
            remember: false,
            onChange: null,
            activeClassName: "tab-active",
            activeLine: false,
        },
        options
    );

    this._originalHTML = this.container.innerHTML;

    this._init();
}

Tabzy.prototype.getPanels = function () {
    return this.tabs
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
};

Tabzy.prototype._cleanRegex = function (input) {
    return input.replace(/[^a-zA-Z0-9]/g, "");
};

Tabzy.prototype._init = function () {
    const searchParams = new URLSearchParams(location.search);
    const tabSelector = searchParams.get(this.selector);

    const tabToActivate =
        (this.opt.remember &&
            tabSelector &&
            this.tabs.find(
                (tab) =>
                    this._cleanRegex(tab.getAttribute("href")) === tabSelector
            )) ||
        this.tabs[0];
    this._activateTab(tabToActivate, (triggerOnChange = false));

    // Event
    this.tabs.forEach(
        (tab) =>
            (tab.onclick = (event) => {
                event.preventDefault();

                this._tryActivateTab(tab);
            })
    );
};

Tabzy.prototype._tryActivateTab = function (tab) {
    if (this.currentTab !== tab) {
        this.currentTab = tab;
        this._activateTab(tab);
    }
};

Tabzy.prototype._activateTab = function (tab, triggerOnChange = true) {
    this.tabs.forEach((tab) =>
        tab.closest("li").classList.remove(this.opt.activeClassName)
    );
    tab.closest("li").classList.add(this.opt.activeClassName);

    this.currentTab = tab;

    this._line(tab);

    this.panels.forEach((panel) => {
        panel.hidden = true;
        panel.classList.remove(this.opt.activeClassName);
    });

    // panel
    const panelActive = document.querySelector(tab.getAttribute("href"));
    panelActive.hidden = false;
    panelActive.classList.add(this.opt.activeClassName);

    // searchParams
    if (this.opt.remember) {
        const params = new URLSearchParams(location.search);
        params.set(this.selector, this._cleanRegex(tab.getAttribute("href")));

        history.replaceState(null, null, `?${params}`);
    }

    // onChange
    if (triggerOnChange && typeof this.opt.onChange === "function") {
        this.opt.onChange({
            tab,
            panel: panelActive,
        });
    }
};

// input: panel selector or tab element
Tabzy.prototype.switch = function (input) {
    const tabToActivate =
        typeof input === "string"
            ? this.tabs.find((tab) => tab.getAttribute("href") === input)
            : this.tabs.includes(input)
            ? input
            : null;

    if (!tabToActivate) {
        console.error(`Tabzy: Invalid input "${input}"`);
        return;
    }

    this._tryActivateTab(tabToActivate);
};

Tabzy.prototype.destroy = function () {
    this.container.innerHTML = this._originalHTML;

    this.panels.forEach((panel) => (panel.hidden = false));
    this.container.closest(".container").classList.add("destroy");

    this.container = null;
    this.tabs = null;
    this.panels = null;
    this.currentTab = null;
};

Tabzy.prototype._line = function (tab) {
    // if has activeLine, remove ::after at 'a', add class sliding at ul
    if (this.opt.activeLine) {
        this.container.classList.add("sliding");

        const line = this.container.querySelector(".active-line");

        line.style.width = `${tab.offsetWidth}px`;
        line.style.left = `${tab.offsetLeft}px`;
    }
};
