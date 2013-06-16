var http = require('http');
var connect = require('connect');
var fs = require('fs');
var shielded = require('shielded');
var urlgreyConnect = require('urlgrey-connect');

var getUniqueId = function(vendorText, statusText, color, scale){
  return new Buffer(JSON.stringify({vendor:vendorText,
                                    status:statusText,
                                    color:color,
                                    scale:scale}))
                .toString('base64');
};

var tempdir = __dirname + '/tmp';
fs.mkdir(tempdir, function(err){
  if (err && !err.message.match(/^EEXIST/)){
    // don't care if the dir already exists.
    throw err;
  }
});


var app = connect();
app.use(urlgreyConnect());
app.use(function(req, res) {

  var options = {
    vendorText : req.uri.query().label,
    statusText : req.uri.query().value,
    color : (req.uri.query().color || 'lightgray'),
    scale : (req.uri.query().scale || 1)
  };

  options.filename = tempdir + '/' + getUniqueId(options.vendorText, 
                                                 options.statusText, 
                                                 options.color, 
                                                 options.scale) + '.png';

  shielded(options, function(err){
    if (!err){
      res.writeHead(200, {'Content-Type': 'image/png'});
      var png = fs.createReadStream(options.filename);
      png.pipe(res);
    } else {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end(err.toString());
    }
  });
});
var port = process.env.PORT || 3000;
http.createServer(app).listen(port);

console.log('Server running at http://127.0.0.1:' + port + '/');

