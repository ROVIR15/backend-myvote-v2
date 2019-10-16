const amqp = require('amqplib/callback_api');
const amqurl = "amqp://localhost:5672"

var amqpConn = null;
function start() {
  amqp.connect(amqurl, function(err, conn) {
    if (err) {
      console.error("[AMQP]", err.message);
      return setTimeout(start, 1000);
    }
    conn.on("error", function(err) {
      if (err.message !== "Connection closing") {
        console.error("[AMQP] conn error", err.message);
      }
    });
    conn.on("close", function() {
      console.error("[AMQP] reconnecting");
      return setTimeout(start, 1000);
    });
    console.log("[AMQP] connected");
    amqpConn = conn;
    whenConnected();
  });
}

function whenConnected() {
  startPublisher();
  startWorker();
}

var pubChannel = null;
var offlinePubQueue = [];
function startPublisher() {
  amqpConn.createConfirmChannel(function(err, ch) {
    if (closeOnErr(err)) return;
      ch.on("error", function(err) {
      console.error("[AMQP] channel error", err.message);
    });
    ch.on("close", function() {
      console.log("[AMQP] channel closed");
    });

    pubChannel = ch;
    while (true) {
      var m = offlinePubQueue.shift();
      if (!m) break;
      publish(m[0], m[1], m[2]);
    }
  });
}

function publish(exchange, routingKey, content) {
  try {
    console.log(content)
    pubChannel.publish(exchange, routingKey, content, { persistent: true },
                      function(err, ok) {
                        if (err) {
                          console.error("[AMQP] publish", err);
                          offlinePubQueue.push([exchange, routingKey, content]);
                          pubChannel.connection.close();
                        }
                      });
  } catch (e) {
    console.error("[AMQP] publish", e.message);
    offlinePubQueue.push([exchange, routingKey, content]);
  }
}

function closeOnErr(err) {
    if (!err) return false;
    console.error("[AMQP] error", err);
    amqpConn.close();
    return true;
}

var chConsume = null
function startWorker() {
    amqpConn.createChannel(function(err, ch) {
      if (closeOnErr(err)) return;
      ch.on("error", function(err) {
        console.error("[AMQP] channel error", err.message);
      });
  
      ch.on("close", function() {
        console.log("[AMQP] channel closed");
      });
  
      ch.prefetch(10);

      //Voter Worker Section//
      ch.assertQueue("receive-info-candidate", {durable: false}, function(err, _ok){
        if(closeOnErr(err)) return;
        ch.consume("receive-info-candidate", processResultInsertCandidate, {noAck: true});
        console.log("info candidate receiver is started");
      })
  
      ch.assertQueue("receive-info-voter", {durable: false}, function(err, _ok){
        if(closeOnErr(err)) return;
        ch.consume("receive-info-voter", processResultInsertVoter, {noAck: false});
        console.log("info voter receiver is started");
      })
      
      function processResultInsertCandidate(msg) {
        
        let tes = msg.content.toString()
        console.log(tes)
        // vote.commit(msg, function(ok) {
        //   try {
        //     if (ok)
        //       ch.reject(msg, true);
        //     else
        //       ch.reject(msg, true);
        //   } catch (e) {
        //     closeOnErr(e);
        //   }
        // });
      }
  
      function processResultInsertVoter(msg){
        console.log(JSON.parse(msg.content.toString()))
    //     let temp = JSON.parse(msg.content.toString());
    //     temp.voters.map(function(voter, index){
    //       setTimeout(function(){
    //         Object.assign(voter, {index: index, role: 'voter', admin: {encpk: temp.encpk}})
    //         publish("", "create-account-voter", new Buffer(JSON.stringify(voter)));
    //       }, 30000*index)
    //     })
    //     ch.ack(msg);
      }  
    })

}

module.exports = {
    start, publish
}