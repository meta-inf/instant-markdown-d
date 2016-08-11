#!env node

var pdc = require('pdc');
var server = require('http').createServer(httpHandler),
    exec = require('child_process').exec,
    io = require('socket.io').listen(server),
    send = require('send'),
    server,
    socket;

server.listen(8090);

function writeMarkdown(input, output, cb) {
  var body = '';
  input.on('data', function(data) {
    body += data;
    if (body.length > 1e6) {
      throw new Error('The request body is too long.');
    }
  });
  input.on('end', function() {
    pdc(body, 'markdown', 'html', ['--katex'], function(e, res) {
      if (e) 
        res = 'ERROR: ' + e;
      
      output.emit('newContent', res);
      if (cb)
        cb();
    });
  });
}

function httpHandler(req, res) {
  switch(req.method)
  {
    case 'GET':
      // TODO: We should distinguish local images from static resource
	  
      // Serve the file from the directory this module is in
      send(req, req.url)
        .root(__dirname + "/static")
        .pipe(res);
      break;

      // case 'HEAD':
      // res.writeHead(200);
      // res.end();
      // exec('open -g http://localhost:8090', function(error, stdout, stderr){
      // http.request({port: 8090})
      // });
      // break;

    case 'DELETE':
      socket.emit('die');
      process.exit();
      break;

    case 'PUT':
      writeMarkdown(req, socket, function(){
        res.writeHead(200);
        res.end();
      });
      break;

    default:
  }
}

io.sockets.on('connection', function(sock){
  socket = sock;
  process.stdout.write('connection established!\n');
  writeMarkdown(process.stdin, socket);
  process.stdin.resume();
});


if (process.platform.toLowerCase().indexOf('darwin') >= 0){
  exec('open -g http://localhost:8090', function(error, stdout, stderr){});
}
else {  // assume unix/linux
  exec('xdg-open http://localhost:8090', function(error, stdout, stderr){});
}
