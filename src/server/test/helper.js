var should = require('should');
var request = require('supertest');
var async = require('async');
var sha1 = require('sha1');

var app = require('../mainTest');

global.hashsalt = "8zgqvU6LaziThJI1uz3PevYd";

global.getRandomStr = function(){

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;

}

global.organization1 = {
    name: "organization1" + global.getRandomStr(),
}

global.user1 = {
    name: "user1",
    userid: "userid1" + global.getRandomStr(),
    password: sha1("password"  + global.getRandomStr()),
    organizationId : 1
}

global.user2 = {
    name: "user2",
    userid: "userid2" + global.getRandomStr(),
    password: sha1("password"  + global.getRandomStr()),
    organizationId : 1
}

global.user3 = {
    name: "user3",
    userid: "userid3" + global.getRandomStr(),
    password: sha1("password"  + global.getRandomStr()),
    organizationId : 1
}

global.user4 = {
    name: "user4",
    userid: "userid4" + global.getRandomStr(),
    password: sha1("password"  + global.getRandomStr()),
    organizationId : 1
}



global.group1 = {
    name: "group1",
    description: "DESCRIPTION group1",
    users: []
}

global.group2 = {
    name: "group2",
    description: "DESCRIPTION group2",
    users: []
}

global.group3 = {
    name: "group3",
    description: "DESCRIPTION group3",
    users: []
}

global.group4 = {
    name: "group4",
    description: "DESCRIPTION group4",
    users: []
}


before(function(doneMain){
    
    this.timeout(15000);
    
    setTimeout(function(){

        async.waterfall([function(done){
            

            // create org
            request(app)
                .post('/api/v2/test/createtemporg')
                .send(global.organization1)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
    			
                var result = {};
                
                result.organization = res.body.data.org;

                global.organization1._id = result.organization._id;
                
                global.user1.organizationId = result.organization._id;
                global.user2.organizationId = result.organization._id;
                global.user3.organizationId = result.organization._id;
                global.user4.organizationId = result.organization._id;

                done(null,result)
            
            }); 

        },
        function(result, done) {

            // create user
            request(app)
                .post('/api/v2/test/createtempuser')
                .send(global.user1)
                .end(function (err, res) {
                
    			if (err) {
    				throw err;
    			}
    			
                global.user1._id = res.body.data.user._id;

                // global.group1.users.push(global.user1._id);

                done(null,result)
            
            });   
            
        },
        function(result, done) {

            // create user
            request(app)
                .post('/api/v2/test/createtempuser')
                .send(global.user2)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
    			
                global.user2._id = res.body.data.user._id;

                // global.group1.users.push(global.user2._id);

                done(null,result)
            
            });  
            
        },
        function(result, done) {

            // create user
            request(app)
                .post('/api/v2/test/createtempuser')
                .send(global.user3)
                .end(function (err, res) {

    			if (err) {
    				throw err;
    			}
    			
                global.user3._id = res.body.data.user._id;

                // global.group1.users.push(global.user3._id);

                done(null,result)
            
            });  
            
        },
        function(result, done) {

            // create user
            request(app)
                .post('/api/v2/test/createtempuser')
                .send(global.user4)
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                
                global.user4._id = res.body.data.user._id;

                // global.group1.users.push(global.user4._id);

                done(null,result)
            
            });  
            
        },
        function(result, done) {

            // create group
            request(app)
                .post('/api/v2/test/createtempgroup')
                .field('name', "GROUP 1")
                .field('sortName', "")
                .field('description', 'GROUP 1 DESCRIPTION')
                .field('organizationId', global.organization1._id)
                .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id + "," + global.user4._id)
                .attach('file', 'src/server/test/samplefiles/user1.jpg')
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                global.group1._id = res.body.data.group._id;

                done(null, result);
            
            });  
            
        },
        function(result, done) { 

            // create group
            request(app)
                .post('/api/v2/test/createtempgroup')
                .field('name', "GROUP 2")
                .field('sortName', "")
                .field('description', 'GROUP 2 DESCRIPTION')
                .field('organizationId', global.organization1._id)
                .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id + "," + global.user4._id)
                .attach('file', 'src/server/test/samplefiles/user2.jpg')
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                global.group2._id = res.body.data.group._id;

                done(null, result);
            
            });  
            
        },
        function(result, done) {

            // create group
            request(app)
                .post('/api/v2/test/createtempgroup')
                .field('name', "GROUP 3")
                .field('sortName', "")
                .field('description', 'GROUP 3 DESCRIPTION')
                .field('organizationId', global.organization1._id)
                .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id + "," + global.user4._id)
                .attach('file', 'src/server/test/samplefiles/user3.png')
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                global.group3._id = res.body.data.group._id;

                done(null, result);
            
            });  
            
        },
        function(result, done) {

            // create group
            request(app)
                .post('/api/v2/test/createtempgroup')
                .field('name', "GROUP 4")
                .field('sortName', "")
                .field('description', 'GROUP 4 DESCRIPTION')
                .field('organizationId', global.organization1._id)
                .field('users', global.user1._id + "," + global.user2._id + "," + global.user3._id + "," + global.user4._id)
                .attach('file', 'src/server/test/samplefiles/user4.png')
                .end(function (err, res) {

                if (err) {
                    throw err;
                }
                
                global.group4._id = res.body.data.group._id;

                done(null, result);
            
            });  
            
        }
        ],
        function(err, result) {
            
            doneMain();
        });
        
    }, 3000);
    
});