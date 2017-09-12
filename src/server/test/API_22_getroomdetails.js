var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/rooms/{roomId} GET', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room4._id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room4._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user4.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns 422, if room id is wrong', (done) => {
            request(app)
                .get('/api/v3/rooms/' + 'wrongId')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.roomidIsWrong);
                    done();
                });
        });

        it('returns room', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room4.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('room');
                    res.body.room.should.have.property('id');   
                    res.body.room.should.not.have.property('_id'); 
                    res.body.room.id.should.equal(global.room4.id);
                    done();
                });
        });

        it('returns room filtered by fields', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room4.id + "?fields=name,created")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('room');
                    res.body.room.should.have.property('id');   
                    res.body.room.should.not.have.property('_id'); 
                    res.body.room.id.should.equal(global.room4.id);                    
                    res.body.room.should.have.property('name');
                    res.body.room.should.have.property('created');
                    res.body.room.should.not.have.property('sortName');                    
                    done();
                });
        });
        
    });
    
});