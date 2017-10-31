import * as config from '../config';
import * as constant from '../const';

class api {

    constructor(){
        
    }

    post(method,postData){

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        return fetch(config.APIEndpoint + method, 
        {   
            method: 'POST', 
            body: JSON.stringify(postData),
            mode: 'cors',
            headers:headers
        })
        .then((res) => {
            
            if(res.status == 200){
                return res.json();
            }else{
                return res.text();
            }

        }).then((response) => {

            return Promise.resolve(response);

        });

    }

    get(method){

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }

        return fetch(config.APIEndpoint + method, 
        {   
            method: 'GET', 
            mode: 'cors',
            headers:headers
        })
        .then((res) => {
            
            if(res.status == 200){
                return res.json();
            }else{
                return res.text();
            }

        }).then((response) => {

            return Promise.resolve(response);

        });

    }

}

export default new api();