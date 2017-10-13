var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var Const = require("../lib/consts");

describe('WEB API', function () {

    var req, res;

    describe('/user/sync POST', function () {

        it('works', function (done) {

            request(app)
                .post('/api/v2/user/sync')
                .send({
                    organization: global.organization1.name,
                    phoneNumbers: global.user5.phoneNumber
                })
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

        it('no organization name', function (done) {

            request(app)
                .post('/api/v2/user/sync')
                .send({
                    organization: "",
                    phoneNumbers: global.user5.phoneNumber
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeNoOrganizationName);

                    done();

                });

        });

        it('wrong organization name', function (done) {

            request(app)
                .post('/api/v2/user/sync')
                .send({
                    organization: "wrong",
                    phoneNumber: global.user5.phoneNumber
                })
                .end(function (err, res) {

                    if (err) {
                        throw err;
                    }

                    res.body.should.have.property('code');
                    res.body.code.should.equal(Const.responsecodeWrongOrganizationName);

                    done();

                });

        });

    });

});