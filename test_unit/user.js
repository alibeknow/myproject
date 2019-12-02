var expect = require('chai').expect;
var app = require('../app');
var request = require('supertest');
var authenticatedUser=require("superagent");
//let's set up the data we need to pass to the login method
const userCredentials = {
    login: '160540022169', 
    password: '654321'
  }
var secretToken;
  //now let's login the user before we run any tests
  authenticatedUser = request.agent(app);
  before(function(done){
    authenticatedUser
    .post('/api/users/login')
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(userCredentials)
    .expect(200)
    .end(function (err, res) {
      if (err) throw err;
      done();
    });
  });
  describe('GET api/users/getServiceProvider', function(done){


    it('Verify User should return 200 ', function(done){
      authenticatedUser.post('/api/users/verify')
      .send({"suppl_id":1204})
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err,res){
      done();
      })
      });

    it('Verify User should return 200 ', function(done){
      authenticatedUser.get('/api/users/get')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err,res){
        expect(res.body.data).to.be.an('object');
      done();
      })
      });


      it('checkhas if we have that ', function(done){
        authenticatedUser.get('/api/users/checkHash')
        .send({secretToken:secretToken})
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err,res){
          expect(res.body.data).to.be.an('object');
        done();
        })
        });


      it('should return a 200 response if the user is logged in', function(done){
        authenticatedUser.get('/api/users/getServiceProvider')
        .send({"suppl_id":1204})
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err,res){
           expect(res.body.successful).to.be.not.null
           done();
        })
        
      });

      it('should return a 401 response and redirect to /login', function(done){
        request(app).post('/api/users/login')
        .set('Accept', 'application/json')
        .expect(401)
        .end(function(err,response){
            done();
        })
      });

      after(function(done) {
        //User.remove().exec();
        return done();
      });
    });