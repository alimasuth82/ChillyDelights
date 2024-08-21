/* 
    Ali Masuth - IT-207-B01

    Part 2: Adding a New Route
    The manager at Chilly Delights wants to add functionality to display an ice cream item by its code.
    - Implement a new route `/menu/{code}` for the GET method.
    - The server will retrieve the menu from the file, locate the ice cream item by its code, and respond with the item details.
    - If the menu file or the item does not exist, the server should respond with a 404 status code and 'Not Found'.
*/

const fs = require('fs');
const http = require('http');
const { URL } = require('url');

// Helper functions
function loadInitializeList(file, cb) {
    fs.readFile(file, 'utf-8', (err, data) => {
        if (err || !data) {
            cb(null);
        } else {
            cb(JSON.parse(data));
        }
    });
}

function storeList(file, list) {
    fs.writeFile(file, JSON.stringify(list), (err) => {
        if (err) {
            console.log('Error: Menu item cannot be added');
        } else {
            console.log('Menu item has been added successfully');
        }
    });
}

// JSON file variables
const menuFile = './menu.json';

// Handlers
const POSTHandler = (file, newItem, cb) => {
    loadInitializeList(file, (list) => {
        if (!list) {
            list = [];
        }
        let itemExists = false;
        for (const item of list) {
            if (item.code === newItem.code) {
                itemExists = true;
                break;
            }
        }
        if (itemExists) {
            cb(400, 'BAD REQUEST (ITEM ALREADY EXISTS)');
        } else {
            list.push(newItem);
            storeList(file, list);
            cb(200, 'OK');
        }
    });
};

const DELETEHandler = (file, code, cb) => {
    loadInitializeList(file, (list) => {
        if (!list || list.length === 0) {
            cb(404, 'Not Found');
            return;
        }
        let index = -1;
        for (let i = 0; i < list.length; i++) {
            if (list[i].code === code) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            cb(404, 'Not Found');
        } else {
            list.splice(index, 1);
            storeList(file, list);
            cb(200, 'OK');
        }
    });
};

const PUTHandler = (file, code, updates, cb) => {
    loadInitializeList(file, (list) => {
        if (!list || list.length === 0) {
            cb(404, 'Not Found');
            return;
        }
        let index = -1;
        for (let i = 0; i < list.length; i++) {
            if (list[i].code === code) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            cb(404, 'Not Found');
        } else {
            Object.assign(list[index], updates);
            storeList(file, list);
            cb(200, 'OK');
        }
    });
};

const GETHandler = (file, code, cb) => {
    loadInitializeList(file, (list) => {
        if (!list || list.length === 0) {
            cb(404, 'Not Found');
            return;
        }

        if (code) {
            let item = null;
            for (const element of list) {
                if (element.code === code) {
                    item = element;
                    break;
                }
            }

            if (!item) {
                cb(404, 'Item not found');
            } else {
                cb(200, JSON.stringify(item));
            }
        } else {
            cb(200, JSON.stringify(list));
        }
    });
};

const requestHandler = (req, res) => {
    const baseURL = 'http://' + req.headers.host + '/';
    const { pathname, searchParams } = new URL(req.url, baseURL);

    const endpoint = pathname.split('/');
    const path = endpoint[1];
    const code = endpoint[2];

    let entries = searchParams.entries();
    const query = Object.fromEntries(entries);

    const method = req.method;

    switch (method) {
        case 'POST':
            if (path === 'menu') {
                POSTHandler(menuFile, query, (statusCode, response) => {
                    res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                    res.writeHead(statusCode);
                    res.end(response);
                });
            } else {
                res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                res.writeHead(400);
                res.end('BAD REQUEST');
            }
            break;
        case 'GET':
            if (path === '' || path === 'welcome') {
                res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                res.writeHead(200);
                const stream = fs.createReadStream('./welcome.txt');
                stream.pipe(res);
                stream.on('error', (err) => {
                    res.writeHead(500);
                    res.end('Internal Server Error (Wrong File Used)');
                });
            } else if (path === 'menu') {
                GETHandler(menuFile, code, (statusCode, response) => {
                    res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                    res.writeHead(statusCode);
                    res.end(response);
                });
            } else {
                res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                res.writeHead(400);
                res.end('BAD REQUEST');
            }
            break;
        case 'DELETE':
            if (path === 'menu') {
                DELETEHandler(menuFile, code, (statusCode, response) => {
                    res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                    res.writeHead(statusCode);
                    res.end(response);
                });
            } else {
                res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                res.writeHead(400);
                res.end('BAD REQUEST');
            }
            break;
        case 'PUT':
            if (path === 'menu') {
                PUTHandler(menuFile, code, query, (statusCode, response) => {
                    res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                    res.writeHead(statusCode);
                    res.end(response);
                });
            } else {
                res.setHeader('Content-Type', 'text/plain; charset="utf-8"');
                res.writeHead(400);
                res.end('BAD REQUEST');
            }
            break;
        default:
            res.end('Invalid method');
            break;
    }
};

const server = http.createServer(requestHandler);

let port = 3030;
server.listen(port, () => {
    console.log(`The server is listening on port ${port}.`);
});