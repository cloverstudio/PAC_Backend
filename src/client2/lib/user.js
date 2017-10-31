import * as constnat from './const';

class user{
    
    constructor(){
        this.lang = constnat.EN;
        this.userData = null;
    }

    signinSucceed(signinData){

        this.userData = signinData.user;

    }

}

export default new user();