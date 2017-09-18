var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/private/{targetUserId}/messages GET', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .get('/api/v3/private/' + global.user2._id + "/messages")
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user1.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .get('/api/v3/private/' + global.user2._id + "/messages")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken + "wrong")
                .expect(403, done) 
        });


        it('returns 422, if user id is wrong', (done) => {
            request(app)
                .get('/api/v3/private/' + 'wrongId' + "/messages")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                });
        });

        it('send text messsage to user works', function (done) {

            request(app)
                .post('/api/v3/send')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    targetType:1, // private message
                    target: global.user2.userid,
                    messageType: 1, // text message
                    message: "hi user"
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

        it('Get messages of the private chat works', (done) => {
            request(app)
                .get('/api/v3/private/' + global.user2._id + "/messages")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('messages');
                    res.body.messages[0].should.have.property('_id');     
                    done();
                });

        });
        
    });
    
});