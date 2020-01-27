export class SongList {
  // @ts-ignore
  songList: [Song] = [];

  jsonToSongList(json: object): void {
    for (const songID in json) {
      if (!json.hasOwnProperty(songID)) {
        continue;
      }

      const songJSON = json[songID];

      const artist: string = songJSON.album.artist.name;

      // @ts-ignore
      this.songList.push(new Song(songJSON.cover, songJSON.album.artist.name, songJSON.album.artist.url, songJSON.title, songJSON.url));
    }
  }
}

export class Song {
  cover: string;
  artist: { name: string, url: string };
  title: { name: string, url: string };

  constructor(cover: string, artistName: string, artistURL: string, titleName: string, titleURL: string) {
    this.cover = cover;
    // @ts-ignore
    this.artist = {};
    // @ts-ignore
    this.title = {};
    this.artist.name = artistName;
    this.artist.url = artistURL;
    this.title.name = titleName;
    this.title.url = titleURL;
  }

}
