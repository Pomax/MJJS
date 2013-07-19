var http = require("http"),
    express = require("express"),
    nunjucks = require("nunjucks"),
    app = express(),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
nunjucksEnv.express(app);
app.use(express.static('public'));
app.listen(3000, function() {
  console.log('Express server listening on port 3000');
});
