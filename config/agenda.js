const Agenda = require('agenda');
const agenda = new Agenda({ db: { address: process.env.MONGO_URI } });

module.exports = agenda;
