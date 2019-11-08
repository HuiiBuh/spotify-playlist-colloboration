/**
 * The playlist class
 */
class Playlist {

    /**
     * Creates a new playlist
     * @param name The name of the playlist
     * @param author The author of the playlist
     * @param songCount The number of songs in the playlist
     * @param url The url of the playlist
     * @param picture The picture of the playlist
     * @param type The type of the playlist "main" of the main playlist
     */
    constructor(name, author, songCount, url, picture, type) {
        this._duration = 0;
        this._name = name;
        this._author = author;
        this._songCount = songCount;
        this._url = url;
        this._picture = picture;
        this._songList = [];
        this._type = type;
        this._durationHumanReadable = "";
    }

    /**
     * Add a song to the playlist
     * @param song The song object
     */
    addSong(song) {
        this._songList.push(song);
        this._calculateDuration();

        if (this.type === "main") {
            this.updatePlaylistInfo();
        }
    }

    /**
     * Update the info of the playlist
     */
    updatePlaylistInfo() {
        document.getElementById("song-count").innerText = this._songCount;
        document.getElementById("duration").innerText = this._durationHumanReadable;
    }

    /**
     * Calculate the duration of the playlist
     * @private
     */
    _calculateDuration() {
        let duration = 0;

        this.songList.forEach(song => {
            duration += song.duration;
        });

        this.duration = duration;
    }

    /**
     * Remove a song
     * @param song The song object
     */
    removeSong(song) {
        let index = this._songList.findIndex(playlist_song => playlist_song.id === song.id);
        this._songList.splice(index, 1)
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
        this.durationHumanReadable = value;
    }

    /**
     * Create the human readable duration
     * @param value {int} The length of the hole playlist in ms
     */
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

    get songList() {
        return this._songList;
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

    get durationHumanReadable() {
        return this._durationHumanReadable;
    }

    get type() {
        return this._type;
    }

}