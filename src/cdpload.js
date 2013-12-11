/**
 * Module dependencies.
 */

var interpolate = require('interpolate'),
    Emitter = require('emitter'),
    classes = require('classes'),
    Upload = require('upload'),
    events = require('events'),
    domify = require('domify'),
    trigger = require('trigger-event'),
    type = require('type')

var template = require('./template')


var cdpload = module.exports = function (el, options) {
  if (!(this instanceof cdpload)) return new cdpload(el, options)
  Emitter.call(this)

  if(type(options) !== 'object')
    options = {}

  if(type(options.accept) === 'string')
    options.accept = [options.accept]

  if(type(options.accept) !== 'array')
    options.accept = []

  if(!options.maxSize)
    options.maxSize = Infinity

  this.ignored = {}
  this.maxSize = options.maxSize
  this.multiple = options.multiple || true
  this.accept = options.accept.filter(function (accept) {
    return (type(accept) === 'string') && accept.match(/(image|video|audio|text|\*)\/(\*|.*?)/)
  }).map(function (accept) {
    return accept.match(/(image|video|audio|text|\*)\/(\*|.*?)/)
  }).map(function (accept) {
    return {type: accept[1], format: accept[2]}
  })

  if(!this.accept.length)
    this.accept = [{type: '*', format: '*'}]

  this.el = el
  this.input = domify(interpolate(template, this.multiple ? 'multiple' : ''))
  this.input = this.el.appendChild(this.input)

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

cdpload.prototype.ignore = function(name){
  this.ignored[name] = true
}

cdpload.prototype.ignoring = function(name){
  return !!this.ignored[name]
}

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

cdpload.prototype.onchange = function () {
  this.upload(this.input.files);
}

cdpload.prototype.onclick = function (ev) {
  if(classes(ev.target).has('cdpload')) return
  ev.stopPropagation()
  ev.preventDefault()

  trigger(this.input, 'click')
}

cdpload.prototype.ondrop = function (ev) {
  if(!ev.dataTransfer.files.length) return

  ev.stopPropagation()
  ev.preventDefault()

  this.classes.remove('over')
  var files = this.multiple ? [ev.dataTransfer.files[0]] : ev.dataTransfer.files
  Array.prototype.filter.call(files, this.filter, this).forEach(this.upload, this)
  this.emit('drop', ev)
}

cdpload.prototype.filter = function (file) {
  if(file.size > this.maxSize) {
    this.emit('maxSizeExceed', file)
    return false
  }

  var accepted = this.accept.some(function (accept) {
    var mime = file.type.split('/')
    var format = mime[1]
    var type = mime[0]

    if(accept.type === '*') return true
    if(accept.type !== type) return false
    if(accept.format === '*') return true
    if(accept.format === format) return true
    return false
  })

  if(!accepted)
    this.emit('typeNotAllowed', file)

  return accepted
}

cdpload.prototype.upload = function(file){
  this.emit('upload', new Upload(file), this.el)
}