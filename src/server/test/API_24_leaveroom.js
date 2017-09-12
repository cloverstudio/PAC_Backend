const should = require('should');
const request = require('supertest');
const app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/rooms/leave POST', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .post('/api/v3/rooms/leave')
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    roomId: global.room2.id
                })
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .post('/api/v3/rooms/leave')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken + "wrong")
                .send({
                    roomId: global.room2.id
                })
                .expect(403, done) 
        });

        it('returns 422, if room id is wrong', (done) => {
            request(app)
                .post('/api/v3/rooms/leave')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    roomId: 'wrongId'
                })
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.roomidIsWrong);
                    done();
                });
        });

        it('returns 422, rooms is not existed', (done) => {
            request(app)
                .post('/api/v3/rooms/leave')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    roomId: "59a2db892061174208544201"
                })
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.roomNotExist);
                    done();
                });
        });

        it('return 403, the owner try to leave room', (done) => {
            request(app)
                .post('/api/v3/rooms/leave')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    roomId: global.room4.id
                })
                .expect(403)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.ownerCannotLeaveRoom);
                    done();
                });
        });

        it('return 422, if user does not exist in the room', (done) => {
            request(app)
                .post('/api/v3/rooms/leave')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    roomId: global.room2.id
                })
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.userNotExistInRoom);
                    done();
                });
        });

        it('non-owner leave room', (done) => {
            request(app)
                .post('/api/v3/rooms/leave')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .send({
                    roomId: global.room3.id
                })
                .expect(200, done)
        });

        it('confirm leaving room', (done) => {
            request(app)
                .get('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('room');
                    res.body.room.users.should.not.containEql(global.user2._id);
                    done();
                });
        });
    });
});