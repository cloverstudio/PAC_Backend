var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/groups/{groupId} PUT', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user1.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns 403, User2 doesn\'t have permission', (done) => {
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(403, done);
        });

        it('returns 422, if group id is wrong', (done) => {
            request(app)
                .put('/api/v3/groups/' + 'wrongId')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(422, done)
        });

        it('returns 422, if name has larger than the max length', (done) => {
            const name = global.getRandomStr(Const.nameMaxLength+1);
            const sortName = 'group_' + global.getRandomStr();            
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', name)                
                .field('description', description)
                .attach('file', 'src/server/test/samplefiles/user1.jpg')
                .expect(422, done)
        });

        it('returns 422, if sortName has larger than the max length', (done) => {
            const name = 'group_' + global.getRandomStr();
            const sortName = global.getRandomStr(Const.nameMaxLength+1);
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', sortName)                
                .field('description', description)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .expect(422, done)
        });

        it('returns 422, if description has larger than the max length', (done) => {
            const name = 'group_' + global.getRandomStr();
            const sortName = name.toLowerCase();
            const description = global.getRandomStr(Const.descriptionMaxLength+1);
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', sortName)                
                .field('description', description)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .expect(422, done)
        });

        it('returns 422, if a new group name is already used', (done) => {
            const name = global.group1.name;
            const sortName = name.toLowerCase();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', sortName)                
                .field('description', description)
                .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .expect(422, done)
        });

        it('returns 422, if users has not existing user\'s id', (done) => {
            const name = 'group_' + global.getRandomStr();
            const sortName = name.toLowerCase();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', sortName)                
                .field('description', description)
                .field('users', global.user1._id + "," + "notExistUserId" + "," + global.user3._id)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .expect(422, done)
        });

        it('Update groups works without params', (done) => {
            const name = 'group_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200, done)
        });

        it('Update groups works without avatar file', (done) => {
            const name = 'group_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', name.toLowerCase())                
                .field('description', description)
                .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id)
                .expect(200, done)
        });

        it('Update groups works with avatar file', (done) => {
            const name = 'group_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/groups/' + global.createdGroup.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', name.toLowerCase())                
                .field('description', description)
                .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id)
                .attach('avatar', 'src/server/test/samplefiles/max.jpg')
                .expect(200, done)
        });
        
    });
    
});