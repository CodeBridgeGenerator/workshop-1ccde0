const assert = require('assert');
const app = require('../../src/app');

describe('\'vehicles\' service', () => {
  it('registered the service', () => {
    const service = app.service('vehicles');

    assert.ok(service, 'Registered the service (vehicles)');
  });
});
