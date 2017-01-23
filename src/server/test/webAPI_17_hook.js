var should = require('should');
var request = require('supertest');
var app = require('../mainTest');
var sha1 = require('sha1');
var util = require('util');

describe('WEB API', function () {

    var req, res;

    describe('/hook/in/new POST', function () {

        it('fail if targetId is wrong', function (done) {

            request(app)
                .post('/api/v2/hook/in/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    targetType: 1,
                    targetId: global.group1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000034);

                done();
                
            });   
            
        });

        it('fail if targetType is wrong', function (done) {

            request(app)
                .post('/api/v2/hook/in/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    targetType: 5,
                    targetId: global.group1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000033);

                done();
                
            });   
            
        });
        
        it('works for user', function (done) {

            request(app)
                .post('/api/v2/hook/in/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    targetType: 1,
                    targetId: global.user1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.data.should.have.property('hook');
                res.body.data.hook.should.have.property('identifier');
                
                global.inHook1 = res.body.data.hook;
                
                done();
                
            });   
            
        });

        it('works for group', function (done) {

            request(app)
                .post('/api/v2/hook/in/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    targetType: 2,
                    targetId: global.group1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.data.should.have.property('hook');
                res.body.data.hook.should.have.property('identifier');
                
                global.inHook2 = res.body.data.hook;
                
                done();
                
            });   
            
        });

        it('works for room', function (done) {

            request(app)
                .post('/api/v2/hook/in/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    targetType: 3,
                    targetId: global.room1 ._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.data.should.have.property('hook');
                res.body.data.hook.should.have.property('identifier');
                
                global.inHook3 = res.body.data.hook;
                
                done();
                
            });   
            
        });
        
    });

    describe('/hook/in/update POST', function () {

        it('works', function (done) {

            request(app)
                .post('/api/v2/hook/in/update')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId : global.inHook1._id,
                    targetType: 3,
                    targetId: global.room1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.data.should.have.property('hook');
                res.body.data.hook.should.have.property('_id');

                done();
                
            });   
            
        });

        it('faild if hookID is wrong', function (done) {

            request(app)
                .post('/api/v2/hook/in/update')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId : global.room1._id,
                    targetType: 3,
                    targetId: global.room1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000040);

                done();
                
            });   
            
        });
        
    });

    describe('/hook/in/remove POST', function () {

        it('works', function (done) {

            request(app)
                .post('/api/v2/hook/in/remove')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId : global.inHook1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                done();
                
            });   
            
        });

        it('fails wrong hookid', function (done) {

            request(app)
                .post('/api/v2/hook/in/remove')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId : global.group1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000043);
                
                done();
                
            });   
            
        });
        
    });
    
    describe('/hook/out/new POST', function () {

        it('fail if url is empty', function (done) {

            request(app)
                .post('/api/v2/hook/out/add')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000036);

                done();
                
            });   
            
        });

        it('works', function (done) {

            request(app)
                .post('/api/v2/hook/out/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    url : "http://www.clover-studio.com",
                    targetType: 1,
                    targetId: global.user1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.data.should.have.property('hook');
                res.body.data.hook.should.have.property('_id');
                
                global.outHook1 = res.body.data.hook;
                
                done();
                
            });   

		});


        it('works', function (done) {

            request(app)
                .post('/api/v2/hook/out/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    url : "http://www.clover-studio.com",
                    targetType: 2,
                    targetId: global.group1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.data.should.have.property('hook');
                res.body.data.hook.should.have.property('_id');
                
                global.outHook2 = res.body.data.hook;
                
                done();
                
            });   

		});
		
		it('works', function (done) {
		
            request(app)
                .post('/api/v2/hook/out/add')
                .set('access-token', global.user1.accessToken)
                .send({
                    url : "http://www.clover-studio.com",
                    targetType: 3,
                    targetId: global.room1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.data.should.have.property('hook');
                res.body.data.hook.should.have.property('_id');
                
                global.outHook4 = res.body.data.hook;
                
                done();
                
            }); 
            
        });
        
    });

    describe('/hook/out/update POST', function () {

        it('fail if url is empty', function (done) {

            request(app)
                .post('/api/v2/hook/out/update')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId: global.outHook4._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000041);

                done();
                
            });   
            
        });

        it('fail if hookId is wrong', function (done) {

            request(app)
                .post('/api/v2/hook/out/update')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId: global.group1._id,
                    targetType: 2,
                    targetId: global.group2._id,
                    url : "http://www.clover-studio.com"
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000042);

                done();
                
            });   
            
        });
        
        it('works', function (done) {

            request(app)
                .post('/api/v2/hook/out/update')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId: global.outHook4._id,
                    targetType: 2,
                    targetId: global.group2._id,
                    url : "http://www.clover-studio.com"
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                res.body.data.should.have.property('hook');
                res.body.data.hook.should.have.property('_id');
                
                global.outHook4 = res.body.data.hook;
                
                done();
                
            });   
            
        });
        
    });

    describe('/hook/out/remove POST', function () {

        it('works', function (done) {

            request(app)
                .post('/api/v2/hook/out/remove')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId : global.outHook4._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                done();
                
            });   
            
        });

        it('fails wrong hookid', function (done) {

            request(app)
                .post('/api/v2/hook/out/remove')
                .set('access-token', global.user1.accessToken)
                .send({
                    hookId : global.group1._id
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000044);
                
                done();
                
            });   
            
        });
        
    });


    describe('/user/hooks GET', function () {

        it('works', function (done) {

            request(app)
                .get('/api/v2/user/hooks')
                .set('access-token', global.user1.accessToken)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                //console.log(util.inspect(res.body, {showHidden: false, depth: null}));
                
                done();
                
            });   
            
        });
        
    });

    describe('/hook/r POST', function () {
        
        it('works', function (done) {

            request(app)
                .post('/api/v2/hook/r/' + global.inHook2.identifier)
                .set('access-token', global.user1.accessToken)
                .send({
                    
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(1);
                
                //console.log(util.inspect(res.body, {showHidden: false, depth: null}));
                
                done();
                
            });   
            
        });


        it('fail if hook doesnt exist', function (done) {

            request(app)
                .post('/api/v2/hook/r/' + global.inHook1.identifier)
                .set('access-token', global.user1.accessToken)
                .send({
                    
                })
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}

                res.body.should.have.property('code');
                res.body.code.should.equal(4000049);
                
                //console.log(util.inspect(res.body, {showHidden: false, depth: null}));
                
                done();
                
            });   
            
        });
        
    });
    
});