const http = require('http');
const path = require('path');
const fs = require('fs');

const hostName = 'localhost';
const port = 3000;

const server = http.createServer((req, res) => {
  console.log('Request for ' + req.url + ' by method ' + req.method);

  if (req.method === 'GET') {
    const fileUrl = req.url === '/' ? '/index.html' : req.url;
    const filePath = path.resolve(`./public${fileUrl}`);
    const fileExt = path.extname(filePath);
    console.log('requested ext: ', fileExt);
    if (fileExt === '.html') {
      fs.exists(filePath, (exists) => {
        if (!exists) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html');
          res.end(
            `<html>
              <title>Not found page</title>
              <body>
                <h1>Requested page does not exist</h1>
              </body>
            </html>
            `
          );
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        fs.createReadStream(filePath).pipe(res);
      });
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      res.end(`
        <html>
          <title>Incorrect file type</title>
          <body>
            <h1>Only html files request allowed</h1>
          </body>
        </html>
      `);
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end(
      `
        <html>
          <title>Not supported</title>
          <body>
            <h1>Requested method is not supported</h1>
          </body>
        </html>
      `
    );
  }
});

server.listen(port, hostName, () => {
  console.log(`Server running at ${hostName}:${port}`);
});
