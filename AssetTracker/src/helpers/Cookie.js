class CookieService {
  timeToMileSecond(time) {
    const number = parseInt(time);
    const unit = time.replace(number, "").trim();

    switch (unit) {
      case "d":
        return number * 24 * 60 * 60 * 1000;
      case "h":
        return number * 60 * 60 * 1000;
      case "m":
        return number * 60 * 1000;
      case "s":
        return number * 1000;
      default:
        return number * 60 * 1000;
    }
  }

  setCookie(name, value, exTime) {
    const d = new Date();
    d.setTime(d.getTime() + this.timeToMileSecond(exTime));
    const expires = "expires=" + d.toUTCString();

    document.cookie =
      `${name}=${encodeURIComponent(value)}; ` +
      `${expires}; ` +
      `path=/; ` +
      `SameSite=Lax`;
  }

  getCookie(name) {
    const cname = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");

    for (let c of ca) {
      c = c.trim();
      if (c.indexOf(cname) === 0) {
        return c.substring(cname.length);
      }
    }
    return "";
  }

  checkCookie(name) {
    return !!this.getCookie(name);
  }
}

const cookieService = new CookieService();

export const setCookie = (name, value, exTime) =>
  cookieService.setCookie(name, value, exTime);
export const getCookie = (name) => cookieService.getCookie(name);
export const checkCookie = (name) => cookieService.checkCookie(name);
export default cookieService;
