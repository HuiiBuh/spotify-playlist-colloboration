class Playlist {

    constructor(name, author, songCount, url, picture) {
        this._duration = 0;
        this._name = name;
        this._author = author;
        this._songCount = songCount;
        this._url = url;
        this._picture = picture;
    }

    addSong(song) {

    }

    removeSong(song) {

    }

    set name(value) {
        this._name = value;
    }

    set author(value) {
        this._author = value;
    }

    set songCount(value) {
        this._songCount = value;
    }

    set url(value) {
        this._url = value;
    }

    set picture(value) {
        this._picture = value;
    }

    set duration(value) {
        this._duration = value;
    }

    get name() {
        return this._name;
    }

    get author() {
        return this._author;
    }

    get songCount() {
        return this._songCount;
    }

    get url() {
        return this._url;
    }

    get picture() {
        return this._picture;
    }

    get duration() {
        return this._duration;
    }

}