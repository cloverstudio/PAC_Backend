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
                .field('userid', name)
                .field('password', name)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.nameNotExist);
                    done();
                });        
        });

        it('returns 422, if userid is empty', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', "")
                .field('password', name)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.useridNotExist);
                    done();
                }); 
        });

        it('returns 422, if passward is empty', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)
                .field('password', "")
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.passwordNotExist);
                    done();
                });
        });

        it('returns 422, if userid has smaller than the min length', (done) => {
            const userid = global.getRandomStr(Const.useridMinLength-1);
            const password = 'user_' + global.getRandomStr();            
            request(app)
                .post('/api/v3/users/')
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
                .post('/api/v3/users/')
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
                .post('/api/v3/users/')
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
                .post('/api/v3/users/')
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
                .post('/api/v3/users/')
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
                .post('/api/v3/users/')
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
            const name = 'user_' + global.getRandomStr();
            const sortName = name.toLowerCase();
            const description = global.getRandomStr(Const.descriptionMaxLength+1);
            request(app)
                .post('/api/v3/users/')
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
                    res.error.text.should.equal(Const.errorMessage.descriptionTooLarge);
                    done();
                });
        });

        it('returns 422, if a new userid is already used', (done) => {
            request(app)
                .post('/api/v3/users/')
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

        it('return 422, if groupid in groups is not correct', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)
                .field('password', name)              
                .field('sortName', "")                
                .field('description', description)
                .field('status', "true")
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
                .post('/api/v3/users/')
                .set('apikey', global.apikey)
                .set('access-token', global.user1.apiaccesstoken)
                .field('name', name)
                .field('userid', name)
                .field('password', name)              
                .field('sortName', "")                
                .field('description', description)
                .field('status', "true")
                .field('groups', global.group1._id + "," + global.user1._id)
                .expect(422)
                .end((err, res) => {
                    if (err) throw err;
                    res.error.text.should.equal(Const.errorMessage.includeGroupsNotExist);
                    done();
                });
        });

        it('Create users works without avatar file', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/users/')
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
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('user');
                    res.body.user.name.should.equal(name);
                    res.body.user.userid.should.equal(name);
                    res.body.user.sortName.should.equal(name.toLowerCase());
                    res.body.user.description.should.equal(description);
                    res.body.user.status.should.equal(1);
                    res.body.user.groups.should.be.instanceof(Array).and.have.lengthOf(3);
                    res.body.user.groups[0].should.equal(global.group1._id);
                    res.body.user.groups[1].should.equal(global.group2._id);
                    res.body.user.groups[2].should.equal(global.department2._id);                                        
                    res.body.user.should.not.have.property('_id');
                    res.body.user.should.have.property('id'); 
                    done();
                });
        });

        it('Create users works with avatar file', (done) => {
            const name = 'user_' + global.getRandomStr();
            const description = 'Description of ' + name;
            request(app)
                .post('/api/v3/users/')
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
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('user');
                    res.body.user.name.should.equal(name);
                    res.body.user.userid.should.equal(name);
                    res.body.user.sortName.should.equal(name.toLowerCase());
                    res.body.user.description.should.equal(description);
                    res.body.user.status.should.equal(1);
                    res.body.user.groups.should.be.instanceof(Array).and.have.lengthOf(3);
                    res.body.user.groups[0].should.equal(global.group1._id);
                    res.body.user.groups[1].should.equal(global.group2._id);
                    res.body.user.groups[2].should.equal(global.department2._id);                    
                    res.body.user.should.have.property('avatar');                     
                    res.body.user.should.not.have.property('_id');
                    res.body.user.should.have.property('id'); 
                    
                    global.createdUser = res.body.user;
                    done();
                });
        });
    });
});