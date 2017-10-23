var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/rooms/{roomId}/users POST', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .post('/api/v3/rooms/' + global.room2.id + "/users")
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .post('/api/v3/rooms/' + global.room2.id + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('Add user to room works', (done) => {
            request(app)
                .post('/api/v3/rooms/' + global.room2.id + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    users:[
                        global.user4._id                   
                    ]
                })
                .expect(403)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                });

        });

        it('returns 422, if room id is wrong', (done) => {
            request(app)
                .post('/api/v3/rooms/' + 'wrongId' + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    done();
                });
        });

        it('Add user to room works', (done) => {
            request(app)
                .post('/api/v3/rooms/' + global.room2.id + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .send({
                    users:[
                        global.user4._id                   
                    ]
                })
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('room');    
                    res.body.room.users.should.be.instanceof(Array).and.have.lengthOf(2);  
                    done();
                });

        });

        it('confirm database update', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room2.id + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;

                    res.body.should.have.property('users');                                        
                    res.body.users.should.be.instanceof(Array).and.have.lengthOf(2);                
                    done();
                });
        });

    });
    
});