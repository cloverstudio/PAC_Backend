var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/messages/{messageId} PUT', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .put('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .put('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns 422, if message id is wrong', (done) => {
            request(app)
                .put('/api/v3/messages/' + 'wrongId')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.messageidIsWrong);
                    done();
                });
        });

        it('returns 403, User who try to update is not sender', (done) => {
            request(app)
                .put('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .send({
                    message: "I'm not sender"
                })
                .expect(403)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.cannotUpdateMessage);
                    done();
                });
        });

        it('Update messages works without params', (done) => {
            request(app)
                .put('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .send({
                    message: ""
                })
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.messageIsEmpty);
                    done();
                });
        });

        it('Update messages works', (done) => {
            request(app)
                .put('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .send({
                    message: "hihi"
                })
                .expect(200, done)
        });
    });
});