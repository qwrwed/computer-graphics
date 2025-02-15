
// server program (CORS)

const http = require('http')
const fs = require('fs')

const PORT = 8080

http
    .createServer((request, response) => {
        fs.readFile(`.${request.url}`, (err, data) => {

            if (err) {
                response.writeHeader(404, {
                    'Content-Type': 'text/plain'
                })
                response.write('404 Not Found')
                response.end()
                return
            }

            if (request.url.endsWith('.html')) {
                response.writeHeader(200, {
                    'Content-Type': 'text/html'
                })
            }

            if (request.url.endsWith('.js')) {
                response.writeHeader(200, {
                    'Content-Type': 'application/javascript'
                })
            }

            response.write(data)
            response.end()
        })
    })
    .listen(PORT, () => console.log(`Hosting webGL project at localhost:${PORT}/index.html`));