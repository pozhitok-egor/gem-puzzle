class Time {
  constructor(timeEl) {
    this.time = timeEl;
    this.min = 0;
    this.sec = 0;
    this.timer = null;
  }

  showTime() {
    const addZero = (n) => {
      return (parseInt(n, 10) < 10 ? '0' : '') + n;
    };
    this.time.innerHTML = `Time: ${addZero(this.min)}:${addZero(this.sec)}`;

    this.sec+=1;
    if (this.sec >= 60) {
      this.sec = 0;
      this.min+=1;
    }
    this.timer = setTimeout(this.showTime.bind(this), 1000);
  }



  clearTimer() {
    clearTimeout(this.timer);
    this.hour = 0;
    this.min = 0;
    this.sec = 0;
    this.timer = null;
  }

  pause() {
    clearTimeout(this.timer);
  }
}

export default Time;