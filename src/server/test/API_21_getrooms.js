var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', () => {

    var req, res;
    
    describe('/v3/rooms GET', () => {
        
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .get('/api/v3/rooms/')
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .get('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns rooms', (done) => {
            request(app)
                .get('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('rooms');
                    res.body.rooms[0].should.have.property('id');   
                    res.body.rooms[0].should.not.have.property('_id');                                        
                    res.body.rooms.should.be.instanceof(Array).and.have.lengthOf(3);                 
                    done();
                });
        });

        it('returns rooms', (done) => {
            request(app)
                .get('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('rooms');
                    res.body.rooms[0].should.have.property('id');   
                    res.body.rooms[0].should.not.have.property('_id');                                        
                    res.body.rooms.should.be.instanceof(Array).and.have.lengthOf(3);
                    res.body.rooms[1].users.should.be.instanceof(Array).and.have.lengthOf(4);
                    res.body.rooms[2].users.should.be.instanceof(Array).and.have.lengthOf(3);
                    done();
                });
        });
    });
});