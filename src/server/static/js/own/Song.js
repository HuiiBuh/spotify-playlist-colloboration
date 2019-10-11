class Song {
    constructor(id, album, url, artist, duration, cover, title) {
        this._id = id;
        this._album = album;
        this._url = url;
        this._artist = artist;
        this._duration = duration;
        this._cover = cover;
        this._title = title;
        this._durationHumanReadable = "";
        this.durationHumanReadable = duration;
    }

    set id(value) {
        this._id = value;
    }

    set album(value) {
        this._album = value;
    }

    set url(value) {
        this._url = value;
    }

    set artist(value) {
        this._artist = value;
    }

    set duration(value) {
        this._duration = value;
        this.durationHumanReadable(value)
    }

    set durationHumanReadable(value) {

        let hDuration = "";

        let seconds = parseInt((value / 1000) % 60).toString();
        seconds = pad(seconds, 2);
        let minutes = (parseInt((value / (1000 * 60) % 60))).toString();
        let hours = (parseInt((value / (1000 * 60 * 60)) % 60)).toString();

        if (hours !== "0") {
            hours = pad(hours, 2);
            hDuration += hours + ":"
        }
        if (hours !== "0" || minutes !== "0") {
            minutes = pad(minutes, 2);
            hDuration += minutes + ":"
        }
        hDuration += seconds;

        this._durationHumanReadable = hDuration;
    }

    set cover(value) {
        this._cover = value;
    }

    set title(value) {
        this._title = value;
    }

    get id() {
        return this._id;
    }

    get album() {
        return this._album;
    }

    get url() {
        return this._url;
    }

    get artist() {
        return this._artist;
    }

    get duration() {
        return this._duration;
    }

    get durationHumanReadable() {
        return this._durationHumanReadable;
    }

    get cover() {
        return this._cover;
    }

    get title() {
        return this._title;
    }
}