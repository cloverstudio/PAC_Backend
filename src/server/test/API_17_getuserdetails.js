var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/users/{userid} GET', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .get('/api/v3/users/' + global.user1._id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .get('/api/v3/users/' + global.user1._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns 422, if user id is wrong', (done) => {
            request(app)
                .get('/api/v3/users/' + 'wrongId')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.useridIsWrong);                    
                    done();
                });
        });

        it('returns user', (done) => {
            request(app)
                .get('/api/v3/users/' + global.user1._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('user');
                    res.body.user.should.have.property('id');   
                    res.body.user.should.not.have.property('_id'); 
                    res.body.user.id.should.equal(global.user1._id);
                    done();
                });
        });

        it('returns user filtered by fields', (done) => {
            request(app)
                .get('/api/v3/users/' + global.user1._id + "?fields=name,created")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('user');
                    res.body.user.should.have.property('id');   
                    res.body.user.should.not.have.property('_id'); 
                    res.body.user.id.should.equal(global.user1._id);                    
                    res.body.user.should.have.property('name');
                    res.body.user.should.have.property('created');
                    res.body.user.should.not.have.property('sortName');                    
                    done();
                });
        });
        
    });
    
});