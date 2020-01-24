class BaseURL {
  private static _chrome = `http://0.0.0.0:5000`;
  private static firefox = `http://localhost:5000`;

  static get url() {
    if (navigator.userAgent.includes("Chrome")) {
      return BaseURL._chrome
    }
    return BaseURL.firefox
  }

}

class API {
  playbackWS = `${BaseURL.url}/api/playback`;
  queueWS = `${BaseURL.url}/api/queue`;
}


export class URLS {
  static placeholderImage = `${BaseURL.url}/static/icons/default_playlist_cover.png`;
  static deviceImage = `${BaseURL.url}/static/icons/devices.png`;

  static api: API = new API();
}
