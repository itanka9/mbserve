#!/usr/bin/env node

import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';
import { dirname } from 'path';
import MBTiles from '@mapbox/mbtiles';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const hostname = 'localhost';
const port = 8080;

const host = `${hostname}:${port}`;

const demoHtml = fs.readFileSync( __dirname + '/demo.html')
    .toString()
    .replace(/%HOST%/g, host);

new MBTiles(process.argv[2], function (err, mbtiles) {
    if (err) {
        console.log('Error opening mbtiles ', err);
        return;
    }
    const server = http.createServer(function (req, res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");

        const url = req.url ?? '';
        if (url === '/') {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.write(demoHtml);
            res.end();
        } else if (url.startsWith('/tile')) {
            const m = url.match(/^\/tile\/(\d+)\/(\d+)\/(\d+)/);
            if (m === null) {
                res.writeHead(404, 'Not found');
                return res.end();
            }
            const [_, z, x, y] = m;
            mbtiles.getTile(z, x, y, function(err, data, headers) {
                if (err) {
                    res.writeHead(500, 'Error fetching tile: '+ err);
                    return res.end();
                }
                res.writeHead(200, headers);
                res.write(data);
                res.end();
            });
        } else if (url.startsWith('/meta')) {
            mbtiles.getInfo(function (err, info) {
                if (err) {
                    res.writeHead(500, 'Error meta');
                    return res.end();
                }
                info.tiles = [
                    "http://localhost:8080/tile/{z}/{x}/{y}"
                ]
                res.writeHead(200, {
                    'Content-Type': 'application/json'
                });
                res.write(JSON.stringify(info, null, 2));
                res.end();
            })
        } else {
            res.writeHead(404, 'Not found');
            res.end();                
        }
    });
    
    server.listen(port, hostname);
});


