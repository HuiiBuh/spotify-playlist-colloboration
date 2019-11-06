class HoverOnTouch {
    constructor() {
        this.elements = document.querySelectorAll("[hover-on-touch]")
    }

    addEvents() {
        let self = this;
        this.elements.forEach(function (node, key, list) {
            node.addEventListener("touchstart", self.addClass);
            node.addEventListener("touchend", self.removeClass);
        })
    }

    addClass(event) {
        event.currentTarget.classList.add("current-touch");
    }

    removeClass(event) {
        event.currentTarget.classList.remove("current-touch")
    }

    removeEvents() {
        let self = this;
        this.elements.forEach(function (node) {
            node.removeEventListener("touchstart", self.addClass);
            node.removeEventListener("touchend", self.removeClass);
        })
    }

    reinitialise() {
        this.removeEvents();
        this.elements = document.querySelectorAll("[hover-on-touch]");
        this.addEvents();
    }

}