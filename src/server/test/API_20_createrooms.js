const should = require('should');
const request = require('supertest');
const app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', () => {

    var req, res;
    
    describe('/v3/rooms POST', () => {
        
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done);
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done);
        });

        it('returns 422, if name has larger than the max length', (done) => {
            const name = global.getRandomStr(Const.nameMaxLength+1);
            const sortName = 'room_' + global.getRandomStr();            
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('description', description)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.nameTooLarge);
                    done();
                }); 
        });

        it('returns 422, if description has larger than the max length', (done) => {
            const name = 'room_' + global.getRandomStr();
            const sortName = name.toLowerCase();
            const description = global.getRandomStr(Const.descriptionMaxLength+1);
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('description', description)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.descriptionTooLarge);
                    done();
                });
        });

        it('return 422, if userid in users is not correct', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('description', description)
                .field('users', global.user1._id + "," + "wrong")
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.includeUsersNotExist);
                    done();
                });
        });

        it('returns 422, if users has not existing user\'s id', (done) => {
            const name = 'room_' + global.getRandomStr();
            const sortName = name.toLowerCase();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('description', description)
                .field('users', global.user1._id + "," + "notExistUserId" + "," + global.user3._id)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.includeUsersNotExist);
                    done();
                });
        });

        it('Create rooms works with no parameter', (done) => {
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('room');                    
                    res.body.room.should.not.have.property('_id');
                    res.body.room.should.have.property('id');                     
                    res.body.room.should.have.property('name');
                    res.body.room.name.should.equal('user1\'s New Room');
                    global.room1 = res.body.room;
                    done();
                });
        });

        it('Create rooms works by non-admin user', (done) => {
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('room');                    
                    res.body.room.should.not.have.property('_id');
                    res.body.room.should.have.property('id');                     
                    res.body.room.should.have.property('name');
                    res.body.room.name.should.equal('user2\'s New Room');                    
                    global.room2 = res.body.room;
                    done();
                });
        });

        it('Create rooms works without avatar file', (done) => {
            const name = 'room3_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('description', description)
                .field('users', global.user2._id + "," + global.user3._id)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('room');                    
                    res.body.room.should.not.have.property('_id');
                    res.body.room.should.have.property('id');                     
                    res.body.room.should.have.property('name');
                    res.body.room.name.should.equal(name);
                    res.body.room.should.have.property('description');
                    res.body.room.description.should.equal(description);
                    res.body.room.users.should.be.instanceof(Array).and.have.lengthOf(3);
                    res.body.room.users[0].should.equal(global.user2._id);
                    res.body.room.users[1].should.equal(global.user3._id);
                    res.body.room.users[2].should.equal(global.user1._id); 
                    res.body.room.should.not.have.property('avatar');
                    global.room3 = res.body.room;
                    done();
                });
        });

        it('Create rooms works with avatar file', (done) => {
            const name = 'room4_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/rooms/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('description', description)
                .field('users', global.user2._id + "," + global.user3._id)
                .attach('avatar', 'src/server/test/samplefiles/max.jpg')
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('room');                    
                    res.body.room.should.not.have.property('_id');
                    res.body.room.should.have.property('id');                     
                    res.body.room.should.have.property('name');
                    res.body.room.name.should.equal(name);
                    res.body.room.should.have.property('description');
                    res.body.room.description.should.equal(description);
                    res.body.room.users.should.be.instanceof(Array).and.have.lengthOf(3);
                    res.body.room.users[0].should.equal(global.user2._id);
                    res.body.room.users[1].should.equal(global.user3._id);   
                    res.body.room.users[2].should.equal(global.user1._id);                    
                    res.body.room.should.have.property('avatar');
                    res.body.room.avatar.should.have.property('picture');                    
                    res.body.room.avatar.should.have.property('thumbnail');
                    global.room4  = res.body.room;
                    done();
                });
        });
    });
});