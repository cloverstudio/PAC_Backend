var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var Const = require("../lib/consts");

describe('WEB API', function () {

    var req, res;

    describe('/user/getContacts GET', function () {

        it('works', function (done) {

            request(app)
                .get('/api/v2/user/getContacts')
                .set('access-token', global.user5.accessToken)
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeSucceed);
                    res.body.should.have.property('data');
                    res.body.data.should.have.property('users');

                    done();

                });

        });

    });

});