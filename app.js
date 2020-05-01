var connection = new WebSocket('ws://localhost:9091/socket');
const configuration = {
  'iceServers': [
      {
          'urls': 'stun:stun.l.google.com:19302'
      },
      {
          'urls': 'turn:10.158.29.39:3478?transport=udp',
          'credential': 'XXXXXXXXXXXXX',
          'username': 'XXXXXXXXXXXXXXX'
      },
      {
          'urls': 'turn:10.158.29.39:3478?transport=tcp',
          'credential': 'XXXXXXXXXXXXX',
          'username': 'XXXXXXXXXXXXXXX'
      }
  ]
};

connection.onmessage = function (message) { 
    console.log("Got message", message.data);
    var data = JSON.parse(message.data); 
     
    switch(data.type) { 
       case "login": 
          onLogin(data.success); 
          break; 
       case "offer": 
          onOffer(data.offer, data.name); 
          break; 
       case "answer": 
          onAnswer(data.answer); 
          break; 
       case "candidate": 
          onCandidate(data.candidate); 
          break; 
       default: 
          break; 
    } 
 };