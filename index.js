
/**
 * Module dependencies.
 */

var Emitter = require('emitter'),
    classes = require('classes'),
    Upload = require('upload'),
    events = require('events'),
    domify = require('domify')

var template = require('./template')


var cdpload = module.exports = function (el, options) {
  if (!(this instanceof cdpload)) return new cdpload(el, options)
  Emitter.call(this)

  this.el = el
  this.el.appendChild(domify(template))
  this.input = this.el.querySelector('.cdpload')

  this.classes = classes(el)
  this.events = events(el, this)

  this.events.bind('drop')
  this.events.bind('dragenter')
  this.events.bind('dragleave')
  this.events.bind('dragover')
  this.events.bind('click')
  this.events.bind('change .cdpload')
}

Emitter(cdpload.prototype)

cdpload.prototype.unbind = function () {
  this.events.unbind()
}

cdpload.prototype.ondragenter = function () {
  this.classes.add('over')
}

cdpload.prototype.ondragover = function (ev) {
  ev.preventDefault()
}

cdpload.prototype.ondragleave = function () {
  this.classes.remove('over')
}

cdpload.prototype.ondrop = function(ev){
  ev.stopPropagation()
  ev.preventDefault()

  this.classes.remove('over')
  this.upload(ev.dataTransfer.files)
  this.emit('drop', ev)
}

cdpload.prototype.click = function(){
  this.input.click()
}

cdpload.prototype.change = function(){
  this.upload(this.files);
}

cdpload.prototype.upload = function(files){
  var file = Array.prototype.shift.call(files)
  this.emit('upload', new Upload(file))
}