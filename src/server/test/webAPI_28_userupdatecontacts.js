var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var Const = require("../lib/consts");

describe('WEB API', function () {

    var req, res;

    describe('/user/updateContacts POST', function () {

        it('works', function (done) {

            request(app)
                .post('/api/v2/user/updateContacts')
                .set('access-token', global.user5.accessToken)
                .send({
                    contacts: [
                        {
                            id: "5a5f2c7244aa2ce0a13310b5",
                            name: "test1"
                        },
                        {
                            id: "5a5f2c7244aa2ce0a13310b6",
                            name: "test2"
                        }
                    ]
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSucceed);
                    res.body.should.have.property('data');

                    done();

                });

        });

    });

});