import sha1 from "sha1";

import api from "./api";
import * as config from "../config";
import * as constant from "../const";

export function callLogin({ organization, username, password }) {
  return api
    .get(constant.ApiUrlTest)
    .then(response => {
      if (!response.time) return Promise.reject("Failed to login");

      return Promise.resolve(response.time);
    })
    .then(time => {
      const tenSec = Math.floor(time / 1000 / 10) + "";
      const key = config.hashSalt + tenSec;
      const secret = sha1(key);
      const passwordHash = sha1(password + config.hashSalt);

      return api
        .post(constant.ApiUrlSignin, {
          organizationid: organization,
          userid: username,
          password: passwordHash,
          secret
        })
        .then(response => {
          if (!response.data) return Promise.reject("Failed to login");
          if (!response.data.newToken) return Promise.reject("Failed to login");

          return Promise.resolve(response.data);
        });
    });
}

export function callLogout() {
  return api.post(constant.ApiUrlSignOut).then(response => {
    return Promise.resolve();
  });
}
