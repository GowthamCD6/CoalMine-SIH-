export const validate = (schema) => (req, res, next) => {
  try {
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
