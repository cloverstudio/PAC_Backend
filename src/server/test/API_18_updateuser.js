var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
const Const = require('../lib/consts');

describe('API', function () {

    var req, res;

    describe('/v3/users/{userid} PUT', function () {
    
        it('returns 401, wrong apiKey', (done) => {
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey + "wrong")
                .set('access-token', global.user1.apiaccesstoken)
                .expect(401, done)
        });

        it('returns 403, Wrong access token', (done) => {
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken + "wrong")
                .expect(403, done) 
        });

        it('returns 403, user2 doesn\'t have permission', (done) => {
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(403, done);
        });

        it('returns 422, if group id is wrong', (done) => {
            request(app)
                .put('/api/v3/users/' + 'wrongId')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.useridIsWrong);
                    done();
                });
        });

        it('returns 422, if userid has smaller than the min length', (done) => {
            const userid = global.getRandomStr(Const.useridMinLength-1);
            const password = 'user_' + global.getRandomStr();    
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', userid)
                .field('userid', userid)
                .field('password', password)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.useridTooShort);
                    done();
                });
        });

        it('returns 422, if password has smaller than the min length', (done) => {
            const userid = 'user_' + global.getRandomStr();                        
            const password = global.getRandomStr(Const.useridMinLength-1);
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', userid)
                .field('userid', userid)
                .field('password', password)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.passwordTooShort);
                    done();
                });
        });

        it('returns 422, if name has larger than the max length', (done) => {
            const name = 'user_' + global.getRandomStr(Const.nameMaxLength+1);
            const userid = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', userid)
                .field('password', userid)                
                .field('sortName', userid)                
                .field('description', description)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.nameTooLarge);
                    done();
                });
        });

        it('returns 422, if sortName has larger than the max length', (done) => {
            const name = 'user_' + global.getRandomStr();
            const sortName = global.getRandomStr(Const.nameMaxLength+1);
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)    
                .field('password', name)                
                .field('sortName', sortName)                
                .field('description', description)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.sortNameTooLarge);
                    done();
                });
        });

        it('returns 422, if userid has larger than the max length', (done) => {
            const name = 'user_' + global.getRandomStr();
            const userid = global.getRandomStr(Const.nameMaxLength+1);
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', userid)
                .field('password', name)                
                .field('sortName', name)                
                .field('description', description)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.useridTooLarge);
                    done();
                });
        });

        it('returns 422, if password has larger than the max length', (done) => {
            const name = 'user_' + global.getRandomStr();
            const sortName = global.getRandomStr();
            const password = global.getRandomStr(Const.nameMaxLength+1);
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)
                .field('password', password)                
                .field('sortName', sortName)                
                .field('description', description)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.passwordTooLarge);
                    done();
                });
        });

        it('returns 422, if description has larger than the max length', (done) => {
            const name = 'group_' + global.getRandomStr();
            const sortName = name.toLowerCase();
            const description = global.getRandomStr(Const.descriptionMaxLength+1);
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('sortName', sortName)                
                .field('description', description)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.descriptionTooLarge);
                    done();
                });
        });

        it('returns 422, if a new userid name is already used', (done) => {
            request(app)
            .put('/api/v3/users/' + global.createdUser.id)
            .set('apikey', global.apikey)
            .set('access-token', global.user1.apiaccesstoken)
            .field('name', global.user2.name)
            .field('userid', global.user2.userid)
            .field('password', global.user2.password)                
            .field('sortName', global.user2.name)                
            .field('description', global.user2.name)
            .expect(422)
            .end((err, res) => {
                if (err) throw err;
                res.error.text.should.equal(Const.errorMessage.userDuplicated);
                done();
            });
        });

        it('return 422, if userid in users is not correct', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)
                .field('password', name)              
                .field('sortName', "")                
                .field('description', description)
                .field('status', 1)
                .field('groups', global.group1._id + "," + "test")
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.includeGroupsNotExist);
                    done();
                });
        });

        it('return 422, if groups including not exist group.', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)
                .field('password', name)              
                .field('sortName', "")                
                .field('description', description)
                .field('status', 1)
                .field('groups', global.group1._id + "," + global.user1._id)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.includeGroupsNotExist);
                    done();
                });
        });


        it('Update users works without params', (done) => {
            const name = 'group_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .expect(200, done)
        });

        it('Update user works without avatar file', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)
                .field('password', name)              
                .field('sortName', "")                
                .field('description', description)
                .field('status', 1)
                .field('groups', global.group1._id + "," + global.group2._id + "," + global.department2._id)
                .field('permission', 1)
                .field('password', name)
                // .attach('avatar', 'src/server/test/samplefiles/max.jpg')                
                .expect(200, done)
        });

        it('Update user works without avatar file', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .put('/api/v3/users/' + global.createdUser.id)
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)
                .field('password', name)              
                .field('sortName', "")                
                .field('description', description)
                .field('status', 1)
                .field('groups', global.group1._id + "," + global.group2._id + "," + global.department2._id)
                .field('permission', 1)
                .field('password', name)
                .attach('avatar', 'src/server/test/samplefiles/max.jpg')                
                .expect(200, done)
        });
        
    });
    
});