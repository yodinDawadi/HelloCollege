function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success)
      return res
        .status(400)
        .json({ error: "Validation failed", details: result.error.flatten() });
    req[source] = result.data;
    next();
  };
}
function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}
function errorHandler(error, req, res, next) {
  console.error(error);
  res
    .status(error.status || 500)
    .json({ error: error.status ? error.message : "Internal server error" });
}
module.exports = { validate, notFound, errorHandler };
