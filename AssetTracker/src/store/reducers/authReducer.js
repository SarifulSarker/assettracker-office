import { createSlice } from "@reduxjs/toolkit";
import { setCookie, getCookie } from "../../helpers/Cookie.js";

const initialState = {
  user: null,
  isLoggedIn: false,
  email: "",
  tempData: null, // for remember me
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, remember, email, password, token } = action.payload;

      // Update Redux state
      state.user = user;
      state.isLoggedIn = true;
      state.email = remember ? email : "";

      // Save token & user in cookies
      setCookie("token", token, "1d");

      //    console.log("from authreducer", getCookie("token"));
      // setCookie("user", JSON.stringify(user), "1d");

      // Remember email and password
      if (remember) {
        setCookie("email", email, "7d");
        setCookie("password", password, "7d"); // ✅ save password
      } else {
        setCookie("email", "", "-1");
        setCookie("password", "", "-1"); // ✅ clear password
      }
    },

    logout: (state) => {
      console.log("On reducer logout");
      state.user = null;
      state.isLoggedIn = false;
      // state.email = "";

      // // Clear cookies
      setCookie("token", "", "-1");
      // setCookie("user", "", "-1");
      // setCookie("email", "", "-1");
    },

    loadUserFromCookie: (state) => {
      const userCookie = getCookie("user");
      const emailCookie = getCookie("email");

      if (userCookie) {
        state.user = JSON.parse(userCookie);
        state.isLoggedIn = true;
      }

      if (emailCookie) {
        state.email = emailCookie;
      }
    },

    setTempData: (state, action) => {
      state.tempData = action.payload;
    },
  },
});

export const { loginSuccess, logout, loadUserFromCookie, setTempData } =
  authSlice.actions;
export default authSlice.reducer;
