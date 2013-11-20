# cdpload

uploads with **click to upload** and **drop to upload** support

## install

```bash
component install ramitos/cdpload
```

## api

```js
var cdpload = require('cdpload');

var upload_handler = cdpload(document.getElementById('el'), {
  multiple: false, // only accept one file
  accept: 'image/*', // also accepts ['image/*', 'video/*']
})

upload_handler.on('error', function (err) {
  console.error(err.message)
})

upload_handler.on('upload', function (upload) {
  console.log('uploading %s', upload.file.name)

  upload.to('/upload', function (err, req) {})
  upload.on('progress', function (ev) {})
  upload.on('end', function (req) {})
  upload.emit('abort', function (ev) {})
  upload.emit('error', function (err) {})
})
```

## license

MIT