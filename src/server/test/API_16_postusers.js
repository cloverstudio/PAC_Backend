const should = require('should');
const request = require('supertest');
const app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', () => {

    var req, res;
    
    describe('/v3/users POST', () => {
        
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user2.apiaccesstoken)
                .expect(401, done);
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken + "wrong")
                .expect(403, done);
        });

        it('returns 403, User2 doesn\'t have permission', (done) => {
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(403, done);
        });

        it('returns 403, User3 doesn\'t have permission', (done) => {
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user3.apiaccesstoken)
                .expect(403, done);
        });

        it('returns 422, if name is empty', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', "")
                .field('userId', name)
                .field('password', name)
                .expect(422, done)
        });

        it('returns 422, if userId is empty', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userId', "")
                .field('password', name)
                .expect(422, done)
        });

        it('returns 422, if passward is empty', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userId', name)
                .field('password', "")
                .expect(422, done)
        });

        // it('returns 422, if name has larger than the max length', (done) => {
        //     const name = global.getRandomStr(Const.nameMaxLength+1);
        //     const sortName = 'user_' + global.getRandomStr();            
        //     const description = 'Description of ' + name;
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .field('sortName', name)                
        //         .field('description', description)
        //         .attach('file', 'src/server/test/samplefiles/max.jpg')
        //         .expect(422, done)
        // });

        // it('returns 422, if sortName has larger than the max length', (done) => {
        //     const name = 'user_' + global.getRandomStr();
        //     const sortName = global.getRandomStr(Const.nameMaxLength+1);
        //     const description = 'Description of ' + name;
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .field('sortName', sortName)                
        //         .field('description', description)
        //         .attach('file', 'src/server/test/samplefiles/max.jpg')
        //         .expect(422, done)
        // });

        // it('returns 422, if description has larger than the max length', (done) => {
        //     const name = 'user_' + global.getRandomStr();
        //     const sortName = name.toLowerCase();
        //     const description = global.getRandomStr(Const.descriptionMaxLength+1);
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .field('sortName', sortName)                
        //         .field('description', description)
        //         .attach('file', 'src/server/test/samplefiles/max.jpg')
        //         .expect(422, done)
        // });

        // it('returns 422, if a new group name is already used', (done) => {
        //     const name = global.group1.name;
        //     const sortName = name.toLowerCase();
        //     const description = 'Description of ' + name;
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .field('sortName', sortName)                
        //         .field('description', description)
        //         .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id)
        //         .attach('file', 'src/server/test/samplefiles/max.jpg')
        //         .expect(422, done)
        // });

        // it('returns 422, if users has not existing user\'s id', (done) => {
        //     const name = 'user_' + global.getRandomStr();
        //     const sortName = name.toLowerCase();
        //     const description = 'Description of ' + name;
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .field('sortName', sortName)                
        //         .field('description', description)
        //         .field('users', global.user1._id + "," + "notExistUserId" + "," + global.user3._id)
        //         .attach('file', 'src/server/test/samplefiles/max.jpg')
        //         .expect(422, done)
        // });

        // it('Create users works with only name', (done) => {
        //     const name = 'user_' + global.getRandomStr();
        //     const description = 'Description of ' + name;
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .expect(200)
        //         .end((err, res) => {
        //             if (err) throw err;
        //             res.body.should.have.property('group');                    
        //             res.body.group.should.not.have.property('_id');
        //             res.body.group.should.have.property('id');                     
        //             res.body.group.should.have.property('name');
        //             res.body.group.name.should.equal(name);
        //             res.body.group.should.have.property('sortName');
        //             res.body.group.sortName.should.equal(name.toLowerCase());
        //             done();
        //         });
        // });

        // it('Create users works without avatar file', (done) => {
        //     const name = 'user_' + global.getRandomStr();
        //     const description = 'Description of ' + name;
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .field('sortName', name.toLowerCase())                
        //         .field('description', description)
        //         .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id)
        //         .expect(200)
        //         .end((err, res) => {
        //             if (err) throw err;
        //             res.body.should.have.property('group');                    
        //             res.body.group.should.not.have.property('_id');
        //             res.body.group.should.have.property('id');                     
        //             res.body.group.should.have.property('name');
        //             res.body.group.name.should.equal(name);
        //             res.body.group.should.have.property('sortName');
        //             res.body.group.sortName.should.equal(name.toLowerCase());
        //             res.body.group.should.have.property('description');
        //             res.body.group.description.should.equal(description);
        //             res.body.group.users.should.be.instanceof(Array).and.have.lengthOf(3);
        //             res.body.group.users[0].should.equal(global.user1._id);
        //             res.body.group.users[1].should.equal(global.user2._id);
        //             res.body.group.users[2].should.equal(global.user3._id);   
        //             res.body.group.should.not.have.property('avatar');
        //             done();
        //         });
        // });

        // it('Create users works with avatar file', (done) => {
        //     const name = 'user_' + global.getRandomStr();
        //     const description = 'Description of ' + name;
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .field('sortName', name.toLowerCase())                
        //         .field('description', description)
        //         .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id)
        //         .attach('avatar', 'src/server/test/samplefiles/max.jpg')
        //         .expect(200)
        //         .end((err, res) => {
        //             if (err) throw err;
        //             res.body.should.have.property('group');                    
        //             res.body.group.should.not.have.property('_id');
        //             res.body.group.should.have.property('id');                     
        //             res.body.group.should.have.property('name');
        //             res.body.group.name.should.equal(name);
        //             res.body.group.should.have.property('sortName');
        //             res.body.group.sortName.should.equal(name.toLowerCase());
        //             res.body.group.should.have.property('description');
        //             res.body.group.description.should.equal(description);
        //             res.body.group.users.should.be.instanceof(Array).and.have.lengthOf(3);
        //             res.body.group.users[0].should.equal(global.user1._id);
        //             res.body.group.users[1].should.equal(global.user2._id);
        //             res.body.group.users[2].should.equal(global.user3._id);   
        //             res.body.group.should.have.property('avatar');
        //             res.body.group.avatar.should.have.property('picture');                    
        //             res.body.group.avatar.should.have.property('thumbnail');
        //             global.createdGroup = res.body.group;
        //             done();
        //         });
        // });
    });
});