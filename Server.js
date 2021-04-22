/** @module Server */

const http = require('http');
const fs = require('fs');
const ejs = require('ejs');

let verboseMode = false;
if (process.argv[2] == '-v') {
    verboseMode = true;
    vLog('Verbose');
}

const host = '127.0.0.1';
const port = 3000;
const mimeTypes = {
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.vs': 'text/plain',
    '.fs': 'text/plain',
    '.png': 'image/png',
    '.txt': 'text/plain',
    '.md': 'text/markdown'
};

/**
 * Logging function for verbose mode only
 * @param {string} string The string to log
 */
function vLog(string) {
    if (verboseMode) {
        console.log(`[V] ${string}`);
    }
}

// Create basic HTTP server to handle file requests
const server = http.createServer((req, res) => {
    const fileEnding = req.url.substr(req.url.lastIndexOf('.'));
    vLog(`Request for file: ${req.url}`);
    
    if (fileEnding in mimeTypes) {
        // Response for file endings with known mime types
        fs.readFile(`./web/${req.url}`, 'utf8', (err, data) => {
            if (err) {
                console.log(err);
                return respond404(res);
            } else {
                const mimeType = mimeTypes[fileEnding]
                vLog(`Response for file: ${req.url}`
                    + ` with mime type ${mimeType}`)
                res.writeHead(200, {'Content-Type': mimeType});
                res.write(data);
                return res.end();
            }
        });
    } else {
        return respondHTML(req, res);
    }
});

/**
 * Respond to request with template rendered HTML file
 * @param {ServerRequest} req The web request to respond to
 * @param {ServerResponse} res The response to respond with
 * @return {ServerResponse} The new HTML response
 */
function respondHTML(req, res) {
    fs.readFile('./web/index.ejs', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
        }

        res.writeHead(200, {'Content-Type': 'text/html'});
        try {
            const rendered = ejs.render(data,
                {filename: './web/index.ejs', StageName: `${req.url}`});
            res.write(rendered);
        } catch (error) {
            const rendered = ejs.render(data,
                {filename: './web/index.ejs', StageName: 'test'});
            res.write(rendered);
        }
        return res.end();
    });
}

/**
 * Turns a response into a 404 and returns it
 * @param {ServerResponse} res The response to turn into a 404
 * @returns {ServerResponse} The new 404 response
 */
function respond404(res) {
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.write('404');
    return res.end();
}

// Start listening for requests
server.listen(port, host, () => {
    console.log(`http://${host}:${port}`);
});