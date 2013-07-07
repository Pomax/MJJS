var http = require("http"),
    express = require("express"),
    nunjucks = require("nunjucks"),
    app = express(),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
nunjucksEnv.express(app);

app.get("/", function(req, res) {
  res.render("public/index.html");
});

var js = function(_, res, next) {
  res.header('Content-Type', 'application/javascript');
  next();
};

app.use(express.static('public'));

app.use(js);
app.use(express.static('src/core'));
app.use(express.static('src/utils'));

app.listen(3000, function() {
  console.log('Express server listening on port 3000');
});
