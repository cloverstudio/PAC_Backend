var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', () => {

    var req, res;
    
    describe('/v3/groups/:groupId/users POST', () => {

        it('returns 401, wrong apiKey', (done) => {
            
            request(app)
                .post('/api/v3/groups/' + global.createdGroup2.id + "/users")
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user1.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .post('/api/v3/groups/' + global.createdGroup2.id + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns 422, if group id is wrong', (done) => {
            request(app)
                .post('/api/v3/groups/' + 'wrongId' + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(422, done)
        });

        it('returns 422, if users is wrong', (done) => {
            request(app)
                .post('/api/v3/groups/' + global.createdGroup2.id + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(422, done)
        });

        /*
        // crete group for test
        it('Create group again', (done) => {

            console.log('---------------------------------------');
            const name = 'group_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/groups/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', name.toLowerCase())                
                .field('description', description)
                .field('users', global.user1._id )
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('group');                    
                    res.body.group.should.not.have.property('_id');
                    res.body.group.should.have.property('id');                     
                    res.body.group.should.have.property('name');

                    global.createdGroup2 = res.body.group;
                    //done();
                });
        });
        */

        it('returns group updated detail', (done) => {
            request(app)
                .post('/api/v3/groups/' + global.createdGroup2.id + "/users")
                .send({
                    users:[
                        global.user3._id,
                        global.user4._id                   
                    ]
                })
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;     
                    res.body.should.have.property('group');
                    res.body.group.should.have.property('id');   
                    res.body.group.should.not.have.property('_id'); 
                    res.body.group.id.should.equal(global.createdGroup2.id);                    
                    res.body.group.should.have.property('name');
                    res.body.group.should.have.property('created');    
                    res.body.group.users.should.be.instanceof(Array).and.have.lengthOf(4); 
                    done();
                });
        });

        it('confirm database update', (done) => {
            request(app)
                .get('/api/v3/groups/' + global.createdGroup2.id + "/users")
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;

                    res.body.should.have.property('users');                                        
                    res.body.users.should.be.instanceof(Array).and.have.lengthOf(4);                
                    done();
                });
        });

    });

});