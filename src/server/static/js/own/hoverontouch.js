/**
 * Adds a current-touch class to the current element that is touched
 */
class HoverOnTouch {
    /**
     * Get all elements that have the hover-on-touch attribute and add events to them
     */
    start() {
        this.elements = document.querySelectorAll("[hover-on-touch]");
        this.addEvents();
    }

    /**
     * Add the events to the classes
     */
    addEvents() {
        let self = this;
        this.elements.forEach(function (node, key, list) {
            node.addEventListener("touchstart", self.addClass);
            node.addEventListener("touchend", self.removeClass);
        })
    }

    /**
     * Add the class to the element that has triggered the event
     * @param event (event that has been triggered)
     */
    addClass(event) {
        event.currentTarget.classList.add("current-touch");
    }

    /**
     * Remove the class form the element that has triggered the event
     * @param event
     */
    removeClass(event) {
        event.currentTarget.classList.remove("current-touch")
    }

    /**
     * Remove all events
     */
    removeEvents() {
        let self = this;
        this.elements.forEach(function (node) {
            node.removeEventListener("touchstart", self.addClass);
            node.removeEventListener("touchend", self.removeClass);
        })
    }

    /**
     * Reinitialise the hover touch
     */
    reinitialise() {
        this.removeEvents();
        this.elements = document.querySelectorAll("[hover-on-touch]");
        this.addEvents();
    }

}