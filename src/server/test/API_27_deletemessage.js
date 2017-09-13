var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/messages/{messageId} DELETE', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .delete('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .delete('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('return 403, user1 is not sender', (done) => {
            request(app)
                .delete('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(403)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.cannotDeleteMessage);
                    done();
                });
        });

        it('returns 422, if message id is wrong', (done) => {
            request(app)
                .delete('/api/v3/messages/' + 'wrongId')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.messageidIsWrong);
                    done();
                });
        });

        it('returns 422, messages is not existed', (done) => {
            request(app)
                .delete('/api/v3/messages/' + "59a2db892061174208544201")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.messageNotExist);
                    done();
                });
        });

        // it('confirm message exist', (done) => {
        //     request(app)
        //         .get('/api/v3/messages/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user2.apiaccesstoken)
        //         .expect(200)
        //         .end((err, res) => {
        //             if (err) throw err;
        //             res.body.should.have.property('messages');
        //             res.body.messages.should.be.instanceof(Array).and.have.lengthOf(3);
        //             done();
        //         });
        // });

        it('delete message', (done) => {
            request(app)
                .delete('/api/v3/messages/' + global.createdMessage._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200, done)
        });

        // it('confirm deleting message', (done) => {
        //     request(app)
        //         .get('/api/v3/messages/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user2.apiaccesstoken)
        //         .expect(200)
        //         .end((err, res) => {
        //             if (err) throw err;
        //             res.body.should.have.property('messages');
        //             res.body.messages.should.be.instanceof(Array).and.have.lengthOf(1);
        //             done();
        //         });
        // });
    });
});