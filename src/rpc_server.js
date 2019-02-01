#!/usr/bin/env node

var amqp = require('amqplib/callback_api');

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
        var q = 'rpc_queue';                                //c. idempotent operations so far (obviously, should be imported from a list of CONSTANT.js file

        ch.assertQueue(q, {durable: false});
        ch.prefetch(1);
        console.log(' [x] Awaiting RPC requests');

        //step 3
        ch.consume(q, function (msg) {                      //d. start - async all the way down to ch.sendToQueue(...)
            console.log('msg', msg)
            var n = parseInt(msg.content.toString());

            console.log(" [.] fib(%d)", n);

            var r = fibonacci(n);

            //step 4
            ch.sendToQueue(msg.properties.replyTo,
                new Buffer(r.toString()),
                {correlationId: msg.properties.correlationId});     //unique uuid from rpc_client.js

            ch.ack(msg);
        });
    });
});

function fibonacci(n) {
    if (n === 0 || n === 1)
        return n;
    else
        return fibonacci(n - 1) + fibonacci(n - 2);
}
