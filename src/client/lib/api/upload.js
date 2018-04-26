
import * as config from '../config';
import * as constant from '../const';
import user from '../user';

class FileUploadManager {

    constructor() {
        this.chats = {};
        this.abortErr = new Error('UPLOAD_ABORTED');
        this.failErr = new Error('UPLOAD_FAILED');
    }

    uploadFile(fileID, chatID, file, progressCB) {
        if (typeof this.chats[chatID] === 'undefined') {
            this.chats[chatID] = {};
        }

        const req = new XMLHttpRequest();

        let resolve;
        let reject;
        let uploadPromise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });


        req.open('POST', config.APIEndpoint + constant.ApiUrlFileUpload)
        if (user.token) {
            req.setRequestHeader('access-token', user.token);
        }

        req.upload.addEventListener('progress', function (e) {
            const progress = Math.floor(e.loaded / e.total * 100);
            progressCB(progress, fileID, chatID);
        });

        req.addEventListener('load', e => {
            if (e.target.status === 200) {
                resolve(JSON.parse(e.target.responseText).data);
            }
            else {
                reject(this.failErr);
            }
        });

        req.addEventListener('error', e => {
            reject(this.failErr);
        });

        const abortPromiseFn = () => {

            return new Promise((res, rej) => {
                req.abort();

                if (req.status === 0) {
                    reject(this.abortErr);
                    res('Upload canceled');
                }
                else {
                    rej(this.abortErr);
                }
            })
        }

        this.chats[chatID][fileID] = {
            uploadPromise,
            abortPromiseFn
        }

        req.send(file);

        return uploadPromise;

    }

    abortUpload(fileID, chatID) {
        return new Promise((resolve, reject) => {
            this.chats[chatID][fileID].abortPromiseFn()
                .then(success => resolve(success))
                .catch(err => reject(err))
        })

    }

}

export default new FileUploadManager();