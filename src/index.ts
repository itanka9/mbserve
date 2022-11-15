#!/usr/bin/env node

import fs from 'fs';
import { fileURLToPath } from 'url';
import http from 'http';
import { dirname } from 'path';
import minimist from 'minimist';
import MBTiles from '@mapbox/mbtiles';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cmdLineOptions = minimist(process.argv.slice(2));

const hostname = cmdLineOptions.b ?? 'localhost';
const port = Number(cmdLineOptions.p ?? 8080);

const host = `${hostname}:${port}`;

if (cmdLineOptions._.length === 0 || cmdLineOptions.h) {
    console.log(`Usage: mbserve <path-to-mbtiles>
    
    Options: 
        -b <hostname or ip> - bind to specified hostname or ip.
        -p <port> - port listen to.
        
    Routes:
        http://${host} - simple demo page to view and explore your .mbtiles dataset.
        http://${host}/meta - dataset metainformation (aka tiles.json)
        http://${host}/tile/{z}/{x}/{y} - tileserver route.`)
    process.exit(1);
} 


const demoHtml = fs.readFileSync( __dirname + '/demo.html')
    .toString()
    .replace(/%HOST%/g, host);

new MBTiles(cmdLineOptions._[0], function (err, mbtiles) {
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
                    if (err.message === 'Tile does not exist') {
                        res.writeHead(204, err.message);
                        return res.end();
                    }
                    console.log(err.message);
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
                    `http://${host}/tile/{z}/{x}/{y}`
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
    
    console.log(`Listening on ${host}`);
    server.listen(port, hostname);
});


