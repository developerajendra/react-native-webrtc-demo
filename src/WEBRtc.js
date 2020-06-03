import React, {useState, useEffect} from 'react';
import {View, SafeAreaView, Button, StyleSheet, Text} from 'react-native';
import {
  RTCPeerConnection,
  RTCView,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals} from 'react-native-webrtc';
import io from "socket.io-client";

export default function WEBRtc({roomNumber}) {
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  

  let isCaller, rtcPeerConnection;
  const socket = io("https://desolate-earth-25164.herokuapp.com/");
  // const socket = io("http://192.168.0.102:3000");
  

  const constraints = {
    audio: false,
    video:true
  };


/**
 * Getting ready for local stream 
 */
  const startLocalStream = () => {
      socket.emit('joinTheRoom', roomNumber);
  };

// useEffect(()=>{
 
    socket.on('roomCreated', room=>{
      console.log('room created');
      
      mediaDevices.getUserMedia(constraints)
        .then(stream=>{
          setLocalStream(stream);
          isCaller = true;
        })
    });
  
    socket.on('roomJoined', room=>{
      console.log('room joined');
      mediaDevices.getUserMedia(constraints)
        .then(stream=>{
          setLocalStream(stream);
          socket.emit('ready', roomNumber)
        });
    });
  
    const configuration = {iceServers: [
      {'urls':'stun:stun.services.mozilla.com'},
      {'urls':'stun:stun.l.google.com:19302'}
    ]};
    
  
  socket.on('ready', ()=>{
    console.log('ready', isCaller);
    
    if(isCaller){
      console.log('ready 1');
        rtcPeerConnection = new RTCPeerConnection(configuration);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream = onAddStream;
        // rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
        // rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
        rtcPeerConnection.createOffer()
        .then(sessionDescription=>{
            rtcPeerConnection.setLocalDescription(sessionDescription).
            then(()=>{
                console.log('sending offer', sessionDescription);
                socket.emit('offer',{
                    type:'offer',
                    sdp: sessionDescription,
                    room: roomNumber
                });
            });
        })
        .catch(error=>{
            console.log(error);
        });
    }
  });



  socket.on('offer', (event)=>{
    if(!isCaller){
      console.log('offer');
      
        rtcPeerConnection = new RTCPeerConnection(configuration);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream = onAddStream;
        // rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
        // rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
        console.log('reccived offer', event);
        
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
        rtcPeerConnection.createAnswer()
        .then(sessionDescription=>{
            console.log('sending the answer',sessionDescription);
            rtcPeerConnection.setLocalDescription(sessionDescription);
          
            
            socket.emit('answer',{
                type:'answer',
                sdp: sessionDescription,
                room: roomNumber
            })
            
        })
        .catch(error=>{
            console.log(error);
        });
    }
  });


  socket.on('answer', event=>{
    console.log('reccived answer', event);
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
  });




  function onAddStream(event){
    console.log('add stream');
    
    remoteStream.srcObject = event.streams[0];
    setRemoteStream(event.streams[0]);
  };


  function onIceCandidate(event){
    console.log('ice candidate');
    
    if(event.candidate){
        console.log('sending ice candidate', event.candidate);
        
        socket.emit('candidate',{
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            room: roomNumber
        });
    }
  }



  socket.on('candidate', event=>{
    console.log('candidate');
    
    const candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate:event.candidate
    });
    console.log('reccived candidated', candidate);
    
    rtcPeerConnection.addIceCandidate(candidate);
  })  
  
// }, [localStream, remoteStream ]);
   
  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.streamContainer}>
      <View style={styles.streamWrapper}>
          <View style={styles.localStream}>
            {localStream && <RTCView style={styles.rtc} streamURL={localStream.toURL()} />}
            {!localStream && <Button title="Tap to start" onPress={startLocalStream} />}
          </View>
          <View style={styles.rtcview}>
            {remoteStream && <RTCView style={styles.rtc} streamURL={remoteStream.toURL()} />}
          </View>
        </View>
        {/* {!!remoteStream ? <Button style={styles.toggleButtons} title="Click to stop call" onPress={closeStreams} disabled={!remoteStream} /> : localStream && <Button title="Click to start call" onPress={startCall}  />} */}
    </View>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#313131',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    width:'100%'
  },
  streamContainer:{
    backgroundColor: 'grey',
    // justifyContent: 'space-around',
    alignItems: 'center',
    height: '50%',
    width: '100%',
    flexDirection:'column'
  },
  streamWrapper:{
    backgroundColor: 'grey',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    flexDirection:'row'
  },
  roomTitle:{
    fontSize:20,
    paddingTop:20
  },
  rtcview: {
    width: '45%',
    height: '60%',
    borderColor:'#ccc',
    borderWidth:3,
    
  },
  rtc: {
    width: '100%',
    height: '100%',
  },
  localStream:{
    width: '45%',
    height: '60%',
    borderColor:'#ccc',
    borderWidth:3,
    display:'flex',
    alignItems:'center',
    flexDirection:'row',
    justifyContent:'space-around',
    
  }
});






 