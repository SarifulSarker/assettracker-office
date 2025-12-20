class CookieService {
  timeToMileSecond(time) {
    const number = time.substring(0, time.indexOf(" "));

    switch (time.substr(time.indexOf(" ") + 1)) {
      case "day":
        return number * 24 * 60 * 60 * 1000;
      case "hour":
        return number * 60 * 60 * 1000;
      case "minute":
        return number * 60 * 1000;
      case "second":
        return number * 1000;
      default:
        return number * 60 * 1000;
    }
  }

  setCookie(cname, cvalue, exTime) {
    const d = new Date();
    d.setTime(d.getTime() + this.timeToMileSecond(exTime));
    const expires = "expires=" + d.toUTCString();

    document.cookie = cname + "=" + cvalue + "; Secure; path=/";
  }

  getCookie(cname) {
    const name = cname + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  checkCookie(cname) {
    const cookieInfo = this.getCookie(cname);
    return !!cookieInfo;
  }
}

const cookieService = new CookieService();

// Export individual functions
export const setCookie = (name, value, exTime) =>
  cookieService.setCookie(name, value, exTime);
export const getCookie = (name) => cookieService.getCookie(name);
export const checkCookie = (name) => cookieService.checkCookie(name);

export default cookieService;
