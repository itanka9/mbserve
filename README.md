# mbserve - tiny *.mbtiles server / previewer

Usage: 

```
npx mbserve <tileset>.mbtiles
```

## Preview

Go to http://localhost:8080 for preview. This preview is based on layers description in tileset metainfo and does not use any specific styling. So do not expect production quality.

![preview](https://github.com/itanka9/mbserve/blob/main/preview.png?raw=true)

## Vector tiles server

You can grab vector tiles from:

```
http://localhost:8080/tile/{z}/{x}/{y}
```

and metainfo (`tiles.json`) from 

```
http://localhost:8080/meta
```