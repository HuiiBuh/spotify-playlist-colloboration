const baseURL = `http://localhost:5000`;

class API {

  playbackWS = `${baseURL}/api/playback`;
  queueWS = `${baseURL}/api/queue`;
}


export class URLS {
  static placeholderImage = `${baseURL}/static/icons/default_playlist_cover.png`;
  static deviceImage = `${baseURL}/static/icons/devices.png`;

  static api: API = new API();
}
