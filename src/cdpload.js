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
  this.multiple = !!options.multiple
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
  if (!options.no_picker) {
    this.input = domify(interpolate(template, this.multiple ? 'multiple' : ''))
    this.input = this.el.appendChild(this.input)
  }

  this.classes = classes(el)
  this.events = events(el, this)

  this.events.bind(interpolate('drop%s', options.class ? ' .' + options.class : ''))
  this.events.bind(interpolate('dragenter%s', options.class ? ' .' + options.class : ''))
  this.events.bind(interpolate('dragleave%s', options.class ? ' .' + options.class : ''))
  this.events.bind(interpolate('dragover%s', options.class ? ' .' + options.class : ''))
  if (!options.no_picker) this.events.bind('change .cdpload')

  if(!options.provide_event && !options.no_picker)
    this.events.bind('click')
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
  Array.prototype.forEach.call(this.input.files, this.upload, this);
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
  this.emit('drop', ev)

  var files = this.multiple ? [ev.dataTransfer.files[0]] : ev.dataTransfer.files
  Array.prototype.filter.call(files, this.filter, this).forEach(function(file){
    this.upload(file, ev.delegateTarget);
  }, this);
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

cdpload.prototype.upload = function(file, el){
  if (!el) el = this.el;
  this.emit('upload', new Upload(file), el);
}