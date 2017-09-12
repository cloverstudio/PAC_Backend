var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/rooms/{roomId} PUT', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .put('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user1.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .put('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns 422, if name has larger than the max length', (done) => {
            const name = global.getRandomStr(Const.nameMaxLength+1);
            const sortName = 'room_' + global.getRandomStr();            
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', name)                
                .field('description', description)
                .attach('file', 'src/server/test/samplefiles/user1.jpg')
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
                .put('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', sortName)                
                .field('description', description)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.descriptionTooLarge);
                    done();
                });
        });

        it('Update rooms works without params', (done) => {
            const name = 'room_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200, done)
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

        it('Update rooms works without avatar file', (done) => {
            const name = 'room_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('description', description)
                .expect(200, done)
        });

        it('Update rooms works with avatar file', (done) => {
            const name = 'room_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/rooms/' + global.room3.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('description', description)
                .attach('avatar', 'src/server/test/samplefiles/user1.jpg')
                .expect(200, done)
        });
        
    });
    
});