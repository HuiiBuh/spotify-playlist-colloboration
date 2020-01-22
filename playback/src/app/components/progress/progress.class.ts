export class Progress {

  private _duration: number;
  private _current: number;
  private _playing: boolean;


  constructor(duration: number, current: number, playing: boolean) {
    this._duration = duration;
    this._current = current;
    this._playing = playing
  }

  _msToHuman(ms: number): string {
    let hDuration = "";

    //Get the seconds and fill the missing 0s
    let seconds: string = (Math.round((ms / 1000) % 60)).toString();
    let minutes: string = (Math.round((ms / (1000 * 60) % 60))).toString();
    let hours: string = (Math.round((ms / (1000 * 60 * 60)) % 60)).toString();

    //Pad leading 0s if the hour is not 0
    if (hours !== "0") {
      hDuration += pad(hours, 2) + ":";
    }

    hDuration += pad(minutes, 2) + ":" + pad(seconds, 2);
    return hDuration;
  }

  set playing(value: boolean) {
    this._playing = value;
  }

  set duration(value: number) {
    this._duration = value;
  }

  set current(value: number) {
    this._current = value;
  }

  get playing(): boolean {
    return this._playing;
  }

  get duration(): number {
    return this._duration;
  }

  get durationH(): string {
    return this._msToHuman(this._duration)
  }

  get currentPercent(): number {
    return Math.round((this._current / this._duration) * 100);

  }

  get current(): number {
    return this._current;
  }

  get currentH(): string {
    return this._msToHuman(this._current)
  }

  get playingIcon(): string {
    return this._playing ? "pause" : "play_arrow"
  }
}

/**
 * Pad a string with a number of leading characters (default 0)
 * @param value The item that is supposed to be padded
 * @param width The number of padings
 * @param characters What character should pad
 * @returns {string} The padded value
 */
function pad(value, width, characters = "0") {
  value += '';
  return value.length >= width ? value : new Array(width - value.length + 1).join(characters) + value;
}
