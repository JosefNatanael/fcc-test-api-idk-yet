var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {

    test('POST', function(done) {
      chai.request(server)
          .post('/api/threads/test')
          .send({text:'Chai test',delete_password:'chai'})
          .end(function(err,res){
            assert.equal(res.status,200);
            done();
          })
    });

    test('GET', function(done) {
      chai.request(server)
          .get('/api/threads/test')
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.isArray(res.body);
            done();
          })
    });

    test('PUT', function(done) {
      chai.request(server)
          .put('/api/threads/test')
          .send({thread_id:'5d5b6d940354d51b6c1dbfce'})
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'success')
            done();
          });
    });

    test('DELETE', function(done) {
      chai.request(server)
          .delete('/api/threads/test')
          .send({thread_id:'5d5b6d940354d51b6c1dbfce'})
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'success')
            done();
          })
    });
  });

  suite('API ROUTING FOR /api/replies/:board', function() {

    test('POST', function(done) {
      chai.request(server)
          .post('/api/replies/test')
          .send({thread_id:'5d5b6d940354d51b6c1dbfce',text:'Chai test',delete_password:'asdf'})
          .end(function(err,res){
            assert.equal(res.status,200);
            done();
          })
    });

    test('GET', function(done) {
      chai.request(server)
          .get('/api/replies/test?thread_id=5d5b6d940354d51b6c1dbfce')
          .end(function(err,res){
            assert.equal(res.status,200);
            done();
          });
    });

    test('PUT', function(done) {
      chai.request(server)
          .put('/api/replies/test')
          .send({thread_id:'5d5b6d940354d51b6c1dbfce',reply_id: '5d5b6d940354d51b6c1dbfce'})
          .end(function(err,res){
            assert.equal(res.status,200);
            assert.equal(res.text,'success')
            done();
          })
    });

    test('DELETE', function(done) {
      chai.request(server)
          .put('/api/replies/test')
          .send({thread_id:'5d5b6d940354d51b6c1dbfce',reply_id: '5d5b6d940354d51b6c1dbfce'})
          .end(function(err,res){
            assert.equal(res.status,200);
            done();
          });
    });

  });

});