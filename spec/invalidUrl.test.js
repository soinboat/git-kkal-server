const request = require('supertest');
const randomstring = require('randomstring');
const app = require('../app');

describe('GET `/not-valid-url`', () => {
  it('should respond with 404', (done) => {
    const randomString = randomstring.generate();

    request(app)
      .get(`/${randomString}`)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect(404)
      .end(done);
  });
});
