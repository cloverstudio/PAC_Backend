var should = require('should');
var request = require('supertest');
var app = require('../mainTest');

describe('API', () => {

    var req, res;
    
    describe('Test of checking query parameters', () => {
    
        // keyword
        it('returns group inclucding "2" in name/description if keyword query is "2"', (done) =>{
            request(app)
                .get('/api/v3/groups?keyword=2')
                .set('apiKey', global.apikey)
                .set('access-token', global.apiaccesstoken)
                .expect(200)
                .end((err, res) => {
                    if (err) throw err;
                    res.body.should.have.property('groups');
                    res.body.groups[0].name.should.equal('GROUP 2');
                    done();
                });
        });
        
        it ('returns empty array if keyword query is not correspond', (done) => {
            request(app)
            .get('/api/v3/groups?keyword="keyword"')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(0);                
                done();
            });
        });

        // offset
        it ('returns groups applied the offset', (done) => {
            request(app)
            .get('/api/v3/groups?offset=2')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(2); 
                res.body.groups[0].name.should.equal('GROUP 3');
                res.body.groups[1].name.should.equal('GROUP 4');
                done();
            });
        });

        it ('returns original groups if offset is empty', (done) => {
            request(app)
            .get('/api/v3/groups?offset= ')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4);                 
                done();
            });
        });

        it ('returns empty array if offset is larger than length of groups', (done) => {
            request(app)
            .get('/api/v3/groups?offset=10')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(0);                 
                done();
            });
        });

        it ('returns 422, bad parameters if offset is minus', (done) => {
            request(app)
            .get('/api/v3/groups?offset=-2')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(422, done);
        });

        // limit
        it ('returns groups applied the limit', (done) => {
            request(app)
            .get('/api/v3/groups?limit=2')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(2); 
                res.body.groups[0].name.should.equal('GROUP 1');
                res.body.groups[1].name.should.equal('GROUP 2');
                done();
            });
        });

        it ('returns original groups if limit is empty', (done) => {
            request(app)
            .get('/api/v3/groups?limit= ')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                done();
            });
        });

        it ('returns original groups if limit is larger than length of groups', (done) => {
            request(app)
            .get('/api/v3/groups?limit=10')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                done();
            });
        });

        // offset and limit
        it ('returns groups applied the limit and offset', (done) => {
            request(app)
            .get('/api/v3/groups?offset=2&limit=1')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(1); 
                res.body.groups[0].name.should.equal('GROUP 3');
                done();
            });
        });

        // sort
        it ('returns groups sorted by sort query', (done) => {
            request(app)
            .get('/api/v3/groups?sort=sortName:desc')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                res.body.groups[0].name.should.equal('GROUP 4');
                res.body.groups[1].name.should.equal('GROUP 3');
                res.body.groups[2].name.should.equal('GROUP 2');
                res.body.groups[3].name.should.equal('GROUP 1');                
                done();
            });
        });

        it ('returns original groups if sort query is not correct(1)', (done) => {
            request(app)
            .get('/api/v3/groups?sort=sortName:dafd')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                res.body.groups[0].name.should.equal('GROUP 1');
                res.body.groups[1].name.should.equal('GROUP 2');
                res.body.groups[2].name.should.equal('GROUP 3');
                res.body.groups[3].name.should.equal('GROUP 4');
                done();
            });
        });

        it ('returns original groups if sort query is not correct(2)', (done) => {
            request(app)
            .get('/api/v3/groups?sort=sortName')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                res.body.groups[0].name.should.equal('GROUP 1');
                res.body.groups[1].name.should.equal('GROUP 2');
                res.body.groups[2].name.should.equal('GROUP 3');
                res.body.groups[3].name.should.equal('GROUP 4');
                done();
            });
        });

        it ('returns groups sorted by multiple sort queries', (done) => {
            request(app)
            .get('/api/v3/groups?sort=sortName:desc, created:asc')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                res.body.groups[0].name.should.equal('GROUP 4');
                res.body.groups[1].name.should.equal('GROUP 3');
                res.body.groups[2].name.should.equal('GROUP 2');
                res.body.groups[3].name.should.equal('GROUP 1');                
                done();
            });
        });

        it ('returns original groups if sort query is empty', (done) => {
            request(app)
            .get('/api/v3/groups?sort= ')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                res.body.groups[0].name.should.equal('GROUP 1');
                res.body.groups[1].name.should.equal('GROUP 2');
                res.body.groups[2].name.should.equal('GROUP 3');
                res.body.groups[3].name.should.equal('GROUP 4');
                done();
            });
        });

        

        // offset and limit and sort
        it ('returns groups applied the offset, limit and sort', (done) => {
            request(app)
            .get('/api/v3/groups?offset=1&limit=2&sort=sortName:desc')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(2); 
                res.body.groups[0].name.should.equal('GROUP 3');
                res.body.groups[1].name.should.equal('GROUP 2');
                done();
            });
        });

        // fields
        it ('returns groups selected fields by fields query', (done) => {
            request(app)
            .get('/api/v3/groups?fields=name, created')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                res.body.groups[0].should.have.keys('name','id','created');     
                res.body.groups[0].should.not.have.keys(
                    'sortName', 'description', 'organizationId', '__v', 'users', 'avatar'
                );
                done();
            });
        });

        it ('returns groups if fields query is empty', (done) => {
            request(app)
            .get('/api/v3/groups?fields= ')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(4); 
                res.body.groups[0].should.have.keys(
                    'name','id', 'sortName', 'description', 
                    'created', 'organizationId', '__v', 
                    'users', 'avatar'
                );                
                done();
            });
        });

        // offset, limit, sort and fields
        it ('returns groups applied the offset, limit, sort and fields', (done) => {
            request(app)
            .get('/api/v3/groups?offset=1&limit=2&sort=sortName:desc&fields=name, created')
            .set('apiKey', global.apikey)
            .set('access-token', global.apiaccesstoken)
            .expect(200)
            .end((err, res) => {
                if (err) throw err;
                res.body.should.have.property('groups');
                res.body.groups.should.be.instanceof(Array).and.have.lengthOf(2); 
                res.body.groups[0].name.should.equal('GROUP 3');
                res.body.groups[0].should.have.keys('name','id','created');     
                res.body.groups[0].should.not.have.keys(
                    'sortName', 'description', 'organizationId', '__v', 'users', 'avatar'
                );
                res.body.groups[1].name.should.equal('GROUP 2');                                
                res.body.groups[1].should.have.keys('name','id','created');     
                res.body.groups[1].should.not.have.keys(
                    'sortName', 'description', 'organizationId', '__v', 'users', 'avatar'
                );
                done();
            });
        });
    });
});