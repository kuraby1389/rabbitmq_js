#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

var args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: rpc_client.js num");
    process.exit(1);
}


/*according to this article : https://dzone.com/articles/saga-pattern-how-to-implement-business-transaction-1
saga pattern tips
a. Create a Unique ID per Transaction
b. Add the Reply Address Within the Command
c. Idempotent Operations
d. Avoiding Synchronous Communications
so far, I think this code from rabbitmq tuts cover some basis.
*/

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        //step 1
        ch.assertQueue('', {exclusive: true}, function (err, q) {               //d. start - async all the way down to ch.consume(...)
            var corr = generateUuid();          //a. unique id generated
            var num = parseInt(args[0]);

            console.log(' [x] Requesting fib(%d)', num);
            console.log('q.queue', q.queue);

            //step 2
            ch.sendToQueue('rpc_queue',                             //c. idempotent operations so far (obviously, should be imported from a list of CONSTANT.js file
                new Buffer(num.toString()),
                {correlationId: corr, replyTo: q.queue});           //b. always have replyTo to address which req and res to communicate

            //step 5
            ch.consume(q.queue, function (msg) {
                console.log('msg',msg)
                //step 6 - to check correlationId generated in step 1 to see if it's the right process.
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
