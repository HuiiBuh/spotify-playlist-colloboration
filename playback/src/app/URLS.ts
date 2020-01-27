// tslint:disable:typedef
export const spotifyUserID = 'nhaderer';


class BaseURL {
  private static chrome = `http://0.0.0.0:5000`;
  private static firefox = `http://localhost:5000`;

  static get url(): string {
    return BaseURL.firefox;

    // if (navigator.userAgent.includes("Chrome")) {
    //   return BaseURL.chrome
    // }
    // return BaseURL.firefox
  }

}

class API {
  public playbackWS = `${BaseURL.url}/api/playback`;
  public queueWS = `${BaseURL.url}/api/queue`;
}


export class URLS {

  static placeholderImage = `${BaseURL.url}/static/icons/default_playlist_cover.png`;
  static deviceImage = `${BaseURL.url}/static/icons/devices.png`;
  static search = `${BaseURL.url}/api/spotify/search?spotify-user-id=${spotifyUserID}&q=`;
  static addSongToQueue = `${BaseURL.url}/api/${spotifyUserID}/player/queue?track-id=`;
  static proxy = `${BaseURL.url}/proxy/`;

  static api: API = new API();
}
