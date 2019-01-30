#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: rpc_client.js num");
    process.exit(1);
}

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue('', {exclusive: true}, function (err, q) {
            var corr = generateUuid();
            var num = parseInt(args[0]);

            console.log(' [x] Requesting fib(%d)', num);
            console.log('q.queue', q.queue);


            ch.sendToQueue('rpc_queue',
                new Buffer(num.toString()),
                {correlationId: corr, replyTo: q.queue});


            ch.consume(q.queue, function (msg) {
                if (msg.properties.correlationId === corr) {
                    console.log(' [.] Got %s', msg.content.toString());
                    setTimeout(function () {
                        conn.close();
                        process.exit(0)
                    }, 500);
                }
            }, {noAck: true});

        });
    });
});

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}
