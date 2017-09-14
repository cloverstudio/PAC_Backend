var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', () => {

    var req, res;
    
    describe('/v3/stickers GET', () => {
        
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .get('/api/v3/stickers/')
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .get('/api/v3/stickers/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns stickers to user1', (done) => {
            request(app)
                .get('/api/v3/stickers/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('stickers');
                    console.log(res.body.stickers);
                    res.body.stickers.should.be.instanceof(Array).and.have.lengthOf(0);                 
                    done();
                });
        });

        it('returns stickers to user2', (done) => {
            request(app)
                .get('/api/v3/stickers/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('stickers');
                    res.body.stickers.should.be.instanceof(Array).and.have.lengthOf(0);                           
                    done();
                });
        });
    });
});