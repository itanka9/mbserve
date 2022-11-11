# mbserve - tiny *.mbtiles server / previewer

![preview](https://github.com/itanka9/mbserve/blob/main/preview.png?raw=true)

Usage: 

```
npx mbserve <tileset>.mbtiles
```

## Preview

After running mbserve go to http://localhost:8080 and you see tileset preview. This preview is based on layers description in tileset metainfo and does not use any specific style so do not expect production quality.

## Server

After running mbserve you can grab vector tiles from:

```
http://localhost:8080/tile/{z}/{x}/{y}
```

and metainfo (tiles.json) from 

```
http://localhost:8080/meta
```