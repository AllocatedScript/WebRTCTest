//refernce to all the webpage elements
var divSelectRoom = document.getElementById("selectRoom");
var divConsultingRoom = document.getElementById("consultingRoom");
var inputRoomNumber = document.getElementById("roomNumber");
var btnGoRoom = document.getElementById("goRoom");
var localVideo = document.getElementById("localVideo");
var remoteVideo = document.getElementById("remoteVideo");

//setting up global variables

var roomNumber;
var localStream;
var remoteStream;
var rtcPeerConnection;

//STUN servers

var iceServers = {
    'iceServers' : [
        {'url' : 'stun:stun.services.mozilla.com'},
        {'url' : 'stun:stun.1.google.com:19302'}
    ]
}

var streamConstarints = {audio : true, video : true};
var isCaller;

//connect to the WebSocket server

var socket = new WebSocket('ws://localhost:9090/socket');

//adding a click event to the button
btnGoRoom.onclick = () => {
    if(inputRoomNumber.value === "") {
        alert("Please type a room number");
    } else {
        roomNumber = inputRoomNumber.value;
        socket.send('create or join', roomNumber);
        divSelectRoom.style='display:none';
        divConsultingRoom.style='display:block';
    }
};

socket.onmessage('created', room => {
    //caller gets user media devices with defined constraints
    try {
    navigator.mediaDevices.getUserMedia(streamConstarints).then(stream => {
        localStream = stream;
        localVideo.src = URL.createObjectURL(stream); //shows stream to user
        isCaller = true; //setting current user as caller
    })} catch (err) {
        console.log("Error occurred during media fetch");
    }
});

socket.onmessage('joined', room => {
    //callee gets user media devices
    try {
    navigator.mediaDevices.getUserMedia(streamConstarints).then(stream => {
        localStream = stream;
        localVideo.src = URL.createObjectURL(stream); //shows stream to user
        socket.send('ready', roomNumber);//sends message to the server
        isCaller = true; //setting current user as caller
    })} catch (err) {
        console.log("Error occurred during media fetch");
    }
});

//when server is ready
socket.onmessage('ready', () => {
    if(isCaller) {
        //creates an RTCPeerConnection Object
        rtcPeerConnection = new RTCPeerConnection(iceServers);

        //adding event listeners to the newly created object
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream = onAddStream;

        //add the current local stream to the object
        rtcPeerConnection.onaddstream(localStream);

        //prepare the offer
        rtcPeerConnection.createOffer(setLocalAndOffer, function(e) {
            console.log(e);
        });
    }
});

//incoming offer
socket.onmessage('offer', event => {
    if(!isCaller) {
        //create an RTCPeerConnection Object
        rtcPeerConnection = new RTCPeerConnection(iceServers);

        //adding event listeners to the newly created object
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream = onAddStream;

        //store the offer as remote description
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));

        //prepares an answer
        rtcPeerConnection.createAnswer(setLocalAndAnswer, function(e) {
            console.log(e);
        });
    }
});

//when server emits answer
socket.onmessage('answer', event => {
    //stores it in remote description
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
});

//when server emits candidate
socket.onmessage('candidate', event => {
    //create a candidate object
    var candidate = new RTCIceCandidate({
        sdpMLineIndex:event.label,
        candidate:event.candidate
    });
    //stores candidate
    rtcPeerConnection.addIceCandidate(candidate);
});

//when a user recieves other users streams

function onAddStream(event) {
    remoteVideo.src = URL.createObjectURL(event.stream);
    remoteStream = event.stream;
}

//sends a candidate message to the server
function onIceCandidate(event) {
    if(event.candidate) {
        console.log('sending ice candidate');
        socket.send('candidate', {
            type:'candidate',
            label : event.candidate.sdpMLineIndex,
            id : event.candidate.sdpMid,
            candidate : event.candidate.candidate,
            room : roomNumber
        });
    }
}

//stores offer and sends message to the server
function setLocalAndOffer(sessionDescription) {
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.send('offer', {
        type : 'offer',
        sdp : sessionDescription,
        room : roomNumber,
    });
}

//stores answer and sends message to the server
function setLocalAndAnswer(sessionDescription) {
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.send('answer', {
        type : 'answer',
        sdp : sessionDescription,
        room : roomNumber,
    });
}