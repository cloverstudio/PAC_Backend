var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', function () {

    var req, res;

    describe('/v3/groups/{groupId} GET', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .get('/api/v3/groups/' + global.group1._id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .get('/api/v3/groups/' + global.group1._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns 422, if group id is wrong', (done) => {
            request(app)
                .get('/api/v3/groups/' + 'wrongId')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(422, done)
        });

        it('returns group', (done) => {
            request(app)
                .get('/api/v3/groups/' + global.group2._id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('group');
                    res.body.group.should.have.property('id');   
                    res.body.group.should.not.have.property('_id'); 
                    res.body.group.id.should.equal(global.group2._id);
                    done();
                });
        });

        it('returns group filtered by fields', (done) => {
            request(app)
                .get('/api/v3/groups/' + global.group1._id + "?fields=name,created")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('group');
                    res.body.group.should.have.property('id');   
                    res.body.group.should.not.have.property('_id'); 
                    res.body.group.id.should.equal(global.group1._id);                    
                    res.body.group.should.have.property('name');
                    res.body.group.should.have.property('created');
                    res.body.group.should.not.have.property('sortName');                    
                    done();
                });
        });
        
    });
    
});