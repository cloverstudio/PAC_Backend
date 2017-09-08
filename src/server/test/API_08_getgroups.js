var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', () => {

    var req, res;
    
    describe('/v3/groups GET', () => {
        
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .get('/api/v3/groups/')
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .get('/api/v3/groups/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns groups', (done) => {
            request(app)
                .get('/api/v3/groups/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('groups');
                    res.body.groups[0].should.have.property('id');   
                    res.body.groups[0].should.not.have.property('_id');                                        
                    res.body.groups.should.be.instanceof(Array).and.have.lengthOf(7);                
                    done();
                });
        });
    });
});