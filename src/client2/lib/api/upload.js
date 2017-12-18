
import * as config from '../config';
import * as constant from '../const';
import user from '../user';

export function fileUploadWrapper(fileId, chatId){
    
    const wrapped = function(file, progressCB){
        
        return new Promise(function(resolve, reject){
    
            const req = new XMLHttpRequest();
            
            req.open('POST', config.APIEndpoint + constant.ApiUrlFileUpload)        
    
            if(user.token){
                req.setRequestHeader('access-token', user.token);
            }
        
            req.upload.addEventListener('progress', function(e){
                const progress = Math.floor(e.loaded / e.total * 100);
                progressCB(progress, fileId, chatId);
            })
    
            req.addEventListener('load', e => {
                if (e.target.status === 200){
                    resolve(JSON.parse(e.target.responseText).data);
                }
                else{
                    //todo: handle error
                    reject(e.target.status);
                }
            });
    
            req.addEventListener('error', e => {
                //todo: handle error
                reject(e.target.status);
            })
            
            req.send(file);
        });
        
    }

    return wrapped;

}

// class fileUpload{
//     constructor(fileId, chatId){
//         this.fileId = fileId;
//         this.chatId = chatId;
//     }

//     upload(file, progressCB){
//         return new Promise((resolve, reject)=>{
//             const req = new XMLHttpRequest();

//             req.open('POST', config.APIEndpoint + constant.ApiUrlFileUpload)        
            
//             if(user.token){
//                 req.setRequestHeader('access-token', user.token);
//             }
        
//             req.upload.addEventListener('progress', function(e){
//                 const progress = Math.floor(e.loaded / e.total * 100);
//                 progressCB(progress, fileId, chatId);
//             })
    
//             req.addEventListener('load', e => {
//                 if (e.target.status === 200){
//                     resolve(JSON.parse(e.target.responseText).data);
//                 }
//                 else{
//                     //todo: handle error
//                     reject(e.target.status);
//                 }
//             });
    
//             req.addEventListener('error', e => {
//                 //todo: handle error
//                 reject(e.target.status);
//             })
            
//             req.send(file);
//         });
//     }
// }
//export fileUpload