var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/rooms/{roomId}/messages GET', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room2.id + "/messages")
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user1.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room2.id + "/messages")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken + "wrong")
                .expect(403, done) 
        });


        it('returns 422, if room id is wrong', (done) => {
            request(app)
                .get('/api/v3/rooms/' + 'wrongId' + "/messages")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                });
        });


        it('send text messsage to room works', function (done) {

            request(app)
                .post('/api/v3/messages')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    targetType:3, // room message
                    target: global.room1.id,
                    messageType: 1, // text message
                    message: "hi room"
                })
                .expect(200) 
                .end(function (err, res) {

                if (err) {
                    throw err;
                }

                res.body.should.have.property('message');
                res.body.message.should.have.property('id');
                
                done();
            
            });   
            
        });
        
        it('Get messages of the room works', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room1.id + "/messages")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('messages');
                    
                    done();
                });

        });
        
    });
    
});