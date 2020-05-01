
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

connection.onopen = function () { 
    console.log("Connected"); 
};
connection.onerror = function (err) { 
    console.log("Got error", err); 
};

//send message to server in JSON format
function sendToServer(msg) {
    console.log(msg);
    var msgJSON = JSON.stringify(msg);
    console.log(msgJSON);
    connection.send(msgJSON);
}

connection.onmessage = function(msg) {
    console.log("Got message", msg.data);
    var content = JSON.parse(msg.data);
    var data = content.data;
    switch (content.event) {
    // when somebody wants to call us
    case "join":
        joinRoom(data);
        break;
    // when a remote peer sends an ice candidate to us
    case "candidate":
        handleCandidate(data);
        break;
    default:
        break;
    }
};
//document.getElementById("roomNo").placeholder = Math.floor(Math.random()*1000000000000);
//we fucking start this from here you fucking cocksucker retarded fuck!!!!!!!!!!
//show yourself in the screen
var host = document.getElementById('host');
host.addEventListener('click', hostRoom); 

function hostRoom() {
    var currentRoom = fetchRoomNumber();
    if(currentRoom < 0 || currentRoom == "") {
        alert("Please enter a valid room number!");
    } else {
        alert('hosting room with room number : ' + currentRoom);
        var hostConnection = new RTCPeerConnection(configuration);
        console.log(hostConnection);//checking the state of the connection
        var video = document.getElementById("video");  
        const constraints = {
                video: true,audio : true
        };
        navigator.mediaDevices.getUserMedia(constraints).
            then(function(stream) { 
                hostConnection.addStream(stream); 
                video.srcObject = stream;     
            }).catch(function(err) { console.log("Media not found", err) });
            sendToServer({
                event : "offer",
                //data : offer,
                roomNo : currentRoom
            });
            hostConnection.onicecandidate = function(event) {
                if (event.candidate) {
                    send({
                        event : "candidate",
                        data : event.candidate,
                        roomNo : roomNumber
                    });
                }
            };
        }
}

function newRoomHosted(roomNumber) {
    
        //now we will define a peer connection where we wish to add our stream.
};

//cams getting displayed as "join" is clicked
var join = document.getElementById('join');
join.addEventListener('click', joinRoom); 
function joinRoom() {
    var el = document.createElement("VIDEO");
    const constraints = {
        video: true,audio : true
    };
    navigator.mediaDevices.getUserMedia(constraints).
      then(function(stream) { 
              el.srcObject = stream;
              el.autoplay = true;
          })
        .catch(function(err) { console.log("Media not found", err) });
    var video = document.getElementById("video");
    insertAfter(video, el);
}
    
//insert streams one after another
function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function fetchRoomNumber() {
    var roomNumber = document.getElementById("roomNo").value;
    // console.log(roomNumber);
    return roomNumber;
}