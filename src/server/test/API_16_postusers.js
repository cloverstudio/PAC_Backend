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

        // it('Create users works without avatar file', (done) => {
        //     const name = 'user_' + global.getRandomStr();
        //     const description = 'Description of ' + name;
        //     request(app)
        //         .post('/api/v3/users/')
        //         .set('apikey', global.apikey)
        //         .set('access-token', global.user1.apiaccesstoken)
        //         .field('name', name)
        //         .field('userid', name)
        //         .field('password', name)              
        //         .field('sortName', "")                
        //         .field('description', description)
        //         .field('status', true)
        //         .field('groups', global.group1._id + "," + global.group2._id)
        //         .field('departments', "")
        //         .field('permission', 1)
        //         .field('password', name)
        //         // .attach('avatar', 'src/server/test/samplefiles/max.jpg')                
        //         .expect(200)
        //         .end((err, res) => {
        //             if (err) throw err;
        //             res.body.should.have.property('user');                                        
        //             res.body.group.name.should.equal(name);
        //             res.body.group.userid.should.equal(name);
        //             res.body.group.password.should.equal(name);                    
        //             res.body.group.sortName.should.equal(name.toLowerCase());
        //             res.body.group.description.should.equal(description);
        //             res.body.group.status.should.equal(true);
        //             res.body.group.groups.should.be.instanceof(Array).and.have.lengthOf(2);
        //             res.body.group.users[0].should.equal(global.group1._id);
        //             res.body.group.users[1].should.equal(global.group2._id);
        //             res.body.group.should.not.have.property('avatar');
        //             res.body.group.should.not.have.property('_id');
        //             res.body.group.should.have.property('id'); 
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