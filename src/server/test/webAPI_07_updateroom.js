var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');
var sha1 = require('sha1');

describe('WEB API', function () {

    var req, res;

    describe('/room/update POST', function () {

        it('Update room with picture works', function (done) {

            request(app)
                .post('/api/v2/room/update/')
                .set('access-token', global.user1.accessToken)
                .field('name', 'Room1Changeg')
                .field('roomId', global.room1._id)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .end(function (err, res) {

        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);

                done();

            });                   
                
        });
                                       
    });

    describe('/room/users/add POST', function () {

        it('add users to room works', function (done) {

            request(app)
                .post('/api/v2/room/users/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    roomId:global.room1._id,
                    users : [
                         global.user4._id
                    ]
                })
                .end(function (err, res) {
        
        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('room');
                res.body.data.room.should.have.property('users');
                res.body.data.room.users.should.be.an.instanceOf(Array);
                res.body.data.room.users.should.containEql(global.user4._id)
                
                done();

            });                   
                
        });

        it('fails when room id is wrong', function (done) {

            request(app)
                .post('/api/v2/room/users/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    roomId:"wrong room id",
                    users : [
                         global.user4._id
                    ]
                })
                .end(function (err, res) {
        
        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000025);

                done();

            });                   
                
        });


        it('fails when array of user id is wrong', function (done) {

            request(app)
                .post('/api/v2/room/users/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    roomId:global.room1._id,
                    users : "not array"
                })
                .end(function (err, res) {
        
        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000026);

                done();

            });                   
                
        });

        it('fails when user is not room owner', function (done) {
            
            request(app)
                .post('/api/v2/room/users/add')
                .set('access-token', global.user2.accessToken)
                .send({
                    roomId:global.room1._id,
                    users : [
                        global.user4._id
                   ]
                })
                .end(function (err, res) {
        
                if (err) {
                    throw err;
                }

                res.body.should.have.property('code');
                res.body.code.should.equal(4000089);

                done();

            });                   
                
        });
                                 
    });

    describe('/room/users/remove POST', function () {

        it('remove users to room works', function (done) {

            request(app)
                .post('/api/v2/room/users/remove')
                .set('access-token', global.user1.accessToken)
                .send({
                    roomId:global.room1._id,
                    users : [
                         global.user4._id
                    ]
                })
                .end(function (err, res) {
        
        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('room');
                res.body.data.room.should.have.property('users');
                res.body.data.room.users.should.be.an.instanceOf(Array);
                res.body.data.room.users.should.not.containEql(global.user4._id)
                
                done();

            });                   
                
        });

        it('fails when room id is wrong', function (done) {

            request(app)
                .post('/api/v2/room/users/remove')
                .set('access-token', global.user1.accessToken)
                .send({
                    roomId:"wrong room id",
                    users : [
                         global.user4._id
                    ]
                })
                .end(function (err, res) {
        
        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000027);

                done();

            });                   
                
        });


        it('fails when array of user id is wrong', function (done) {

            request(app)
                .post('/api/v2/room/users/remove')
                .set('access-token', global.user1.accessToken)
                .send({
                    roomId:global.room1._id,
                    users : "not array"
                })
                .end(function (err, res) {
        
        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000028);

                done();

            });                   
                
        });
        
        it('fails when user is not room owner', function (done) {
            
            request(app)
                .post('/api/v2/room/users/remove')
                .set('access-token', global.user2.accessToken)
                .send({
                    roomId:global.room1._id,
                    users : [
                        global.user4._id
                   ]
                })
                .end(function (err, res) {
        
                if (err) {
                    throw err;
                }

                res.body.should.have.property('code');
                res.body.code.should.equal(4000090);

                done();

            });                   
                
        });
        
    });
    
});