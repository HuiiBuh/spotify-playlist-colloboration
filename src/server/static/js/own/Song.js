class Song {
    constructor(id, album, url, artist, duration, image, title) {
        this._id = id;
        this._album = album;
        this._url = url;
        this._artist = artist;
        this._duration = duration;
        this._image = image;
        this._title = title;
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
    }

    set image(value) {
        this._image = value;
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

    get image() {
        return this._image;
    }

    get title() {
        return this._title;
    }
}