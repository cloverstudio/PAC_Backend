var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', function () {

    var req, res;

    describe('/v3/message/send POST', function () {
    
        it('send text messsage works', function (done) {

            request(app)
                .post('/api/v3/message/send')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .send({
                    targetType:1, // private message
                    target: global.user1.userid,
                    messageType: 1, // text message
                    message: "hi"
                })
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('message');
                res.body.message.should.have.property('_id');
                global.createdMessage = res.body.message;
                done();
            
            });   
            
        });


        it('send text messsage to group works', function (done) {

            console.log('send group id',global.group1._id);

            request(app)
                .post('/api/v3/message/send')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    targetType:2, // group message
                    target: global.group1._id,
                    messageType: 1, // text message
                    message: "hi group"
                })
                .expect(200) 
                .end(function (err, res) {

                if (err) {
                    throw err;
                }

                res.body.should.have.property('message');
                res.body.message.should.have.property('_id');
                
                done();
            
            });   
            
        });
        
        it('send file messsage works', function (done) {

            request(app)
                .post('/api/v3/file/upload')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .attach('file', './src/server/test/samplefiles/max.jpg')
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('file');
                res.body.should.have.property('thumbnail');
                
                var file = res.body.file;
                var thumb = res.body.thumbnail;

                request(app)
                    .post('/api/v3/message/send')
                    .set('apikey', global.apikey)
                    .set('access-token', global.user2.apiaccesstoken)
                    .send({
                        targetType:1, // private message
                        target: global.user1.userid,
                        messageType: 2, // file message
                        file:{
                            file:{
                                id:file.fileId,
                                size: file.size,
                                mimeType: file.mimeType,
                                name: "test.jpg"
                            },
                            thumb:{
                                id:thumb.fileId,
                                size: thumb.size,
                                mimeType: thumb.mimeType,
                                name: "test.jpg"
                            },
                        }
                    })
                    .expect(200) 
                    .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('message');
                    res.body.message.should.have.property('_id');
                    
                    done();
                
                });   
            
            });   
            
        });


        it('wrong apikey', function (done) {

            request(app)
                .post('/api/v3/message/send')
                .set('apikey', "sss")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                
                done();
            
            });   
            
        });

        it('wrong access token', function (done) {

            request(app)
                .post('/api/v3/message/send')
                .set('apikey', global.apikey)
                .set('access-token', "sssss")
                .expect(403) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
                
                done();
            
            });   
            
        });

    });
    
});