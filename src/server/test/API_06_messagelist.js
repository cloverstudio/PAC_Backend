var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', function () {

    var req, res;
    
    describe('/v3/message/list POST', function () {
        

        it('getting message list works', function (done) {

            var roomID = "1-" + global.user1._id + "-" + global.user2._id;

            request(app)
                .get('/api/v3/message/list/' + roomID + '/0/old')
                .set('apikey', global.apikey)
                .set('access-token', global.user2.apiaccesstoken)
                .expect(200) 
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('messages');
                res.body.messages.should.be.instanceof(Array).and.have.lengthOf(2);

                done();
            
            });   
            
        });

    });
    
});