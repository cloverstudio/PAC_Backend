import * as config from '../config';
import * as constant from '../const';
import user from '../user';

import * as actions from "../../actions";
import { store } from "../../index";

class api {

    constructor() {

    }

    post(method, postData) {

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        if (user.token) {
            headers['access-token'] = user.token;
        }

        return fetch(config.APIEndpoint + method,
            {
                method: 'POST',
                body: JSON.stringify(postData),
                mode: 'cors',
                headers: headers
            })
            .then((res) => {

                if (res.status == 200) {

                    return res.json();

                } else {

                    return Promise.reject(res.status);

                }

            }).then((response) => {

                if (response.code == 1)
                    return Promise.resolve(response);
                else if (response.code == constant.ErrorCodeInvalidToken) {
                    store.dispatch(actions.logout.forceLogout());
                    return Promise.reject(response.code);
                }
                else
                    return Promise.reject(response.code);

            });

    }

    get(method) {

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        if (user.token) {
            headers['access-token'] = user.token;
        }

        return fetch(config.APIEndpoint + method,
            {
                method: 'GET',
                mode: 'cors',
                headers: headers
            })
            .then((res) => {

                if (res.status == 200) {
                    return res.json();
                } else {
                    return Promise.reject(res.status);
                }

            }).then((response) => {


                if (response.code == 1) {
                    return Promise.resolve(response);
                } else if (response.code == constant.ErrorCodeInvalidToken) {
                    store.dispatch(actions.logout.forceLogout());
                    return Promise.reject(response.code);
                }
                else {
                    return Promise.reject(response.code);
                }
            });

    }

}

export default new api();