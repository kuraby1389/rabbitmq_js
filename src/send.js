#!/usr/bin/env node


/* docs http://www.squaremobius.net/amqp.node/channel_api.html#connect
using callback
var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        var q = 'hello'; //unique and idempotent
        var msg = 'Hello World!';

        ch.assertQueue(q, {durable: false});
        ch.sendToQueue(q, Buffer.from(msg));
        console.log(" [x] Sent %s", msg);
    });

    setTimeout(function () {
        conn.close();
        process.exit(0)
    }, 500);
});*/


//using Promise
var amqp = require('amqplib');
amqp.connect('amqp://localhost')
    .then(function (conn) {
        return conn.createChannel()
    })
    .then(function (ch) {
        const q = 'tasks';
        return ch.assertQueue(q)
            .then(function(ok){
                return ch.sendToQueue(q, Buffer.from('something to do'));
            });
    }).catch(console.warn);
