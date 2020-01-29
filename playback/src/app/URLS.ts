// tslint:disable:typedef
export const spotifyUserID = 'nhaderer';


class BaseURL {
  private static chrome = `http://0.0.0.0:5000`;
  private static firefox = `http://127.0.0.1:5000`;

  static get url(): string {
    return BaseURL.firefox;

    // if (navigator.userAgent.includes('Chrome')) {
    //   return BaseURL.chrome;
    // }
    // return BaseURL.firefox;
  }

}

class API {
  public playbackWS = `${BaseURL.url}/api/playback`;
  public queueWS = `${BaseURL.url}/api/queue`;
  public deviceChange = `${BaseURL.url}/api/${spotifyUserID}/player`;
  public search = `${BaseURL.url}/api/spotify/search?spotify-user-id=${spotifyUserID}&q=`;
  public addSongToQueue = `${BaseURL.url}/api/${spotifyUserID}/player/queue?track-id=`;
  public pause = `${BaseURL.url}/api/${spotifyUserID}/player/pause`;
  public play = `${BaseURL.url}/api/${spotifyUserID}/player/play`;
  public next = `${BaseURL.url}/api/${spotifyUserID}/player/next`;
}


export class URLS {
  static placeholderImage = `${BaseURL.url}/static/icons/default_playlist_cover.png`;
  static deviceImage = `${BaseURL.url}/static/icons/devices.png`;
  static proxy = `${BaseURL.url}/proxy/`;

  static api: API = new API();
}
