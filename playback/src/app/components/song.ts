export class SongList {
  // @ts-ignore
  songList: [Song] = [];

  // tslint:disable-next-line:typedef
  constructor(json: object, queueStatus = '') {

    if (Array.isArray(json)) {
      json.forEach((songJSON, index, array) => {
        this.songList.push(new Song(songJSON.album.images[1].url, songJSON.album.artists[0].name,
          songJSON.artists[0].external_urls.spotify, songJSON.name,
          songJSON.external_urls.spotify, songJSON.id, queueStatus));
      });
      return;
    }

    for (const songID in json) {
      if (!json.hasOwnProperty(songID)) {
        continue;
      }

      const songJSON = json[songID];
      this.songList.push(new Song(songJSON.cover, songJSON.album.artist.name, songJSON.album.artist.url, songJSON.title,
        songJSON.url, songID, queueStatus));
    }
  }
}

export class Song {
  id: string;
  cover: string;
  artist: { name: string, url: string };
  title: { name: string, url: string };
  queueStatus: string;

  constructor(cover: string, artistName: string, artistURL: string, titleName: string, titleURL: string, id: string, queueStatue: string) {
    this.cover = cover;
    // @ts-ignore
    this.artist = {};
    // @ts-ignore
    this.title = {};
    this.artist.name = artistName;
    this.artist.url = artistURL;
    this.title.name = titleName;
    this.title.url = titleURL;
    this.id = id;
    this.queueStatus = queueStatue;
  }

}
