import sha1 from "sha1";

import api from "./api";
import * as config from "../config";
import * as constant from "../const";

export function callSearchAll(value) {
    return api
        .get(constant.ApiUrlSearchAll + "1?keyword=" + value)

        .then(response => {
            if (!response.code || response.code != 1) {
                return Promise.reject("Failed to search all.");
            } else {
                return Promise.resolve(response.data);
            }
        });
}
