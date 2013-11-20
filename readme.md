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
  multiple: false, // only accept one file. default: true
  accept: 'image/*', // also accepts ['image/*', 'video/*']. default: '*/*'
  maxSize: 90000 // default: Infinity
})

upload_handler.on('error', function (err) {})
upload_handler.on('typeNotAllowed', function (file) {})
upload_handler.on('maxSizeExceed', function (file) {})

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