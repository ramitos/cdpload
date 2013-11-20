var Dropload = require('dropload');
var drop = Dropload(document.getElementById('drop'), {
  multiple: false,
  accept: 'image/*',
  accept: ['image/*', 'video/*']
});

drop.on('error', function(err){
  console.error(err.message);
});

drop.on('upload', function(upload){
  console.log('uploading %s', upload.file.name);
  upload.to('/upload');
});