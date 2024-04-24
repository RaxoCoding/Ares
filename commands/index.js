const ping = require('./ping');
const help = require('./help');
const create = require('./create');
const deleteEvent = require('./delete');
const remove = require('./remove');

module.exports = [ ping, help, create, deleteEvent, remove ];