class Playlist {

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

    addSong(song) {
        this._songList.push(song);
        this._calculateDuration();

        if (this.type === "main") {
            this.updatePlaylistInfo();
        }
    }

    updatePlaylistInfo() {
        document.getElementById("song-count").innerText = this._songCount;
        document.getElementById("duration").innerText = this._durationHumanReadable;
    }

    _calculateDuration() {
        let duration = 0;
        for (let songNumber in this._songList) {
            if (this._songList.hasOwnProperty(songNumber)) {
                var song = this._songList[songNumber];
            }
            duration += song.duration;
        }
        this.duration = duration;
    }

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