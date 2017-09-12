var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/rooms/{roomId} DELETE', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .delete('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user1.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .delete('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('return 403, user2 is not the owner', (done) => {
            request(app)
                .delete('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(403)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.cannotDeleteRoom);
                    done();
                });
        });

        it('returns 422, if room id is wrong', (done) => {
            request(app)
                .delete('/api/v3/rooms/' + 'wrongId')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.roomidIsWrong);
                    done();
                });
        });

        it('returns 422, rooms is not existed', (done) => {
            request(app)
                .delete('/api/v3/rooms/' + "59a2db892061174208544201")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.roomNotExist);
                    done();
                });
        });

        it('confirm room exist', (done) => {
            request(app)
                .get('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('rooms');
                    res.body.rooms.should.be.instanceof(Array).and.have.lengthOf(3);
                    done();
                });
        });

        it('delete room without avatar', (done) => {
            request(app)
                .delete('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200, done)
        });

        it('delete room with avatar', (done) => {
            request(app)
                .delete('/api/v3/rooms/' + global.room4.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200, done)
        });

        it('confirm deleting room', (done) => {
            request(app)
                .get('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('rooms');
                    res.body.rooms.should.be.instanceof(Array).and.have.lengthOf(1);
                    done();
                });
        });
    });
});