var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');
var sha1 = require('sha1');

describe('WEB API', function () {

    var req, res;

    describe('/room/new POST', function () {

        it('Create room works', function (done) {

            var params = {  
                users : [
                    global.user1._id,
                    global.user2._id,
                    global.user3._id,
                    global.user4._id
                ],
                name : 'room1'
            };

            request(app)
                .post('/api/v2/room/new')
                .set('access-token', global.user1.accessToken)
                .field('name', 'room1')
                .field('description', 'description')
                .field('userOld', 1)
                .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id)
                .attach('file', 'src/server/test/samplefiles/max.jpg')
                .end(function (err, res) {
        
        		if (err) {
        			throw err;
        		}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.should.have.property('data');
                res.body.data.should.have.property('room');
                res.body.data.room.should.have.property('_id');

                global.room1 = res.body.data.room;

                request(app)
                    .post('/api/v2/room/new')
                    .set('access-token', global.user1.accessToken)
                    .field('name', 'room1')
                    .field('description', 'description')
                    .field('userOld', 1)
                    .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id)
                    .attach('file', 'src/server/test/samplefiles/max.jpg')
                    .end(function (err, res) {
            
                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(1);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('room');
                    res.body.data.room.should.have.property('_id');

                    // save for after test
                    global.room2 = res.body.data.room;
                    
                    done();

                });   

            });                   
                
        });
                                       
    });

});