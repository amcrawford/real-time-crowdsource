const assert = require('assert');
const request = require('request');
const app = require('../server');
const fixtures = require('./fixtures');

describe('Server', () => {

  before((done) => {
    this.port = 9876;

    this.server = app.listen(this.port, (err, result) => {
      if (err) { return done(err); }
      done();
    });

    this.request = request.defaults({
      baseUrl: 'http://localhost:9876/'
    });
  });

  after(() => {
    this.server.close();
  });

  it('should exist', () => {
    assert(app);
  });

  describe('GET /', () => {
    it('should return a 200', (done) => {
      this.request.get('/', (error, response) => {
        if (error) { done(error); }
        assert.equal(response.statusCode, 200);
        done();
      });
    });
  });

  describe('POST /poll', () => {

    beforeEach(() => {
      app.locals.polls = {};
    });

    it('should not return 404', (done) => {
      this.request.post('/poll', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should receive and store data', (done) => {
      var validPoll = {
        poll: {
          title: 'Cool Pizza Poll',
          options: [ 'mushrooms', 'onions', 'garlic', 'black olives' ]
        }
      };

      this.request.post('/poll', { form: validPoll }, (error, response) => {
        if (error) { done(error); }

        var pollCount = Object.keys(app.locals.polls).length;

        assert.equal(pollCount, 1);
        done();
      });
    });
  });

  describe('GET /polls/:id', () => {

    beforeEach(function() {
      app.locals.polls.testPoll = fixtures.validPoll;
    });

    it('should not return a 404', (done) => {
      this.request.get('/polls/testPoll', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });


    it('should return a page that has the title of the poll', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/polls/testPoll', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.title), `"${response.body}" does not include "${poll.title}"`);
        done();
      });
    });

    it('should return a page that has the poll options', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/polls/testPoll', (error, response) => {
        if(error) { done(error); }
        assert(response.body.includes(poll.options[0]),
               `"${response.body}" does not include "${poll.options.first}".`);
        done();
      });
    });

    it('should show closed message if poll is closed', (done) => {
      var poll = app.locals.polls.testPoll;
      poll['closed'] = true;

      this.request.get('/polls/testPoll', (error, response) => {
        if(error) { done(error); }
        assert(response.body.includes("This Poll is Closed"));
        done();
      });
    });
  });

  describe('GET /polls/admin/:adminId', () => {

    beforeEach(function() {
      app.locals.polls.testPoll = fixtures.validPoll;
    });

    it('should not return a 404', (done) => {
      this.request.get('/polls/admin/adminId', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should return a page with admins poll info', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/polls/admin/adminId', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes("Your Polls"), `"${response.body}" does not include Your Polls`);
        assert(response.body.includes(poll.title), `"${response.body}" does not include "${poll.title}"`);
        done();
      });
    });

    it('should return a link to create new poll', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/polls/admin/adminId', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes("Create New Poll"), `"${response.body}" does not include Create New Poll`);
        done();
      });
    });
  });

  describe('GET /polls/:id/:adminId', () => {

    beforeEach(function() {
      app.locals.polls.testPoll = fixtures.validPoll;
    });

    it('should not return a 404', (done) => {
      this.request.get('/polls/testPoll/adminId', (error, response) => {
        if (error) { done(error); }
        assert.notEqual(response.statusCode, 404);
        done();
      });
    });

    it('should return a page with current poll info', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/polls/testPoll/adminId', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.title), `"${response.body}" does not include "${poll.title}"`);
        assert(response.body.includes("Active Poll Link"), `"${response.body}" does not include Active Poll Link`);
        done();
      });
    });

    it('should return a page with current poll options', (done) => {
      var poll = app.locals.polls.testPoll;

      this.request.get('/polls/testPoll/adminId', (error, response) => {
        if (error) { done(error); }
        assert(response.body.includes(poll.options[0]),
               `"${response.body}" does not include "${poll.options.first}".`);
        done();
      });
    });
  });
});
