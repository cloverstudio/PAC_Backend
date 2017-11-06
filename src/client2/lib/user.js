import * as constant from './const';

class user{
    
    constructor(){
        this.lang = constant.EN;
        this.userData = null;

        const checkLocalStoraget = localStorage.getItem(constant.LocalStorageKeyAccessToken);

        if(checkLocalStoraget){
            this.userData = localStorage.getItem(constant.LocalStorageKeyUserData);
            this.token = localStorage.getItem(constant.LocalStorageKeyAccessToken);
        }
    }

    signinSucceed(signinData,save){
        this.userData = signinData.user;
        this.token = signinData.newToken;

        if(save){
            localStorage.setItem(constant.LocalStorageKeyAccessToken, signinData.newToken);
            localStorage.setItem(constant.LocalStorageKeyUserData, signinData.user);
        }else{
            localStorage.removeItem(constant.LocalStorageKeyAccessToken);
            localStorage.removeItem(constant.LocalStorageKeyUserData);
        }
    }

    checkSavedToken(){

    }

}

export default new user();