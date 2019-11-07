/**
 * The song class
 */
class Song {

    /**
     * Creates a new song
     * @param id The spotify id of the song
     * @param album The album of the song
     * @param url The url of the song
     * @param artist The artist of a song
     * @param duration The duration of the song in ms
     * @param cover The cover url of the song
     * @param title The title of the song
     */
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

        //The human readable duration
        let hDuration = "";

        //Get the seconds and fill the missing 0s
        let seconds = parseInt((value / 1000) % 60).toString();
        seconds = pad(seconds, 2);
        let minutes = (parseInt((value / (1000 * 60) % 60))).toString();
        let hours = (parseInt((value / (1000 * 60 * 60)) % 60)).toString();

        //Pad leading 0s if the hour is not 0
        if (hours !== "0") {
            hours = pad(hours, 2);
            hDuration += hours + ":"
        }

        //pad 0s if the hour and minute of a song is 0
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

    get searchString() {
        let artists = "";

        this.artist.forEach(artist => {
            artists += artist.name;
        });

        return this._title + " " + artists + " " + this._album + this._id;
    }
}