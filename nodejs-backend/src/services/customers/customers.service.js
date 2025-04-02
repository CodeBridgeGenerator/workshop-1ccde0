const { Customers } = require('./customers.class');
const createModel = require('../../models/customers.model');
const hooks = require('./customers.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: ["$populate"],
    multi: ["create"],
  };

  // Initialize our service with any options it requires
  app.use('/customers', new Customers(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('customers');

  // Get the schema of the collections 
  app.get("/customersSchema", function (request, response) {
    const schema = createModel(app).schema.tree;
    const result = Object.keys(schema).map(key => {
      return {
        field: key,
        properties: schema[key]
      };
    });
    return response.status(200).json(result);
  });

  service.hooks(hooks);
};