import React, {useState, useEffect} from 'react';
import {View, SafeAreaView, Button, StyleSheet, Text} from 'react-native';
import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';
import io from "socket.io-client";

export default function WEBRtc({roomNumber}) {


      const [localStream, setLocalStream] = useState();
      const [remoteStream, setRemoteStream] = useState();
      const [isCaller, setisCaller] = useState();

      const [cachedLocalPC, setCachedLocalPC] = useState();
      const [cachedRemotePC, setCachedRemotePC] = useState();

      let rtcPeerConnection;

      const iceServers = {
          'iceServer':[
              {'urls':'stun:stun.services.mozilla.com'},
              {'urls':'stun:stun.l.google.com:19302'}
          ]
      };

      

      const streamConstrains = {
          audio: true,
          video: true
      };



      const socket = io("http://192.168.10.90:3000");


      let init = () => {
          socket.emit('joinTheRoom', roomNumber);
      }

      useEffect(()=>{
        init();
      }, []);

         

    socket.on('created', room=>{
          mediaDevices.getUserMedia(streamConstrains)
          .then(stream=>{
            
              setLocalStream(stream);
              setisCaller(true);
          }).catch(error=>{
              console.log('An error occured', error);  
          });
      });




      socket.on('joined', room=>{
          mediaDevices.getUserMedia(streamConstrains)
          .then(stream=>{
              setisCaller(false);
              setLocalStream(stream);
              socket.emit('ready', roomNumber)
          }).catch(error=>{
              console.log('An error occured', error);
              
          });
      });



      socket.on('ready', ()=>{
          if(isCaller){
              rtcPeerConnection = new RTCPeerConnection(iceServers);
              rtcPeerConnection.onicecandidate = onIceCandidate;
              rtcPeerConnection.ontrack = onAddStream;
              rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
              rtcPeerConnection.createOffer()
              .then(sessionDescription=>{
                  rtcPeerConnection.setLocalDescription(sessionDescription);
                  console.log('sending offer', sessionDescription);
                  
                  socket.emit('offer',{
                      type:'offer',
                      sdp: sessionDescription,
                      room: roomNumber
                  });


                  setCachedLocalPC(rtcPeerConnection);
                  
              })
              .catch(error=>{
                  console.log(error);
              });
          }
      });



      socket.on('offer', (event)=>{
          if(!isCaller){
              rtcPeerConnection = new RTCPeerConnection(iceServers);
              rtcPeerConnection.onicecandidate = onIceCandidate;
              rtcPeerConnection.ontrack = onAddStream;
              rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
              console.log('reccived offer', event);
              
              rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
              rtcPeerConnection.createAnswer()
              .then(sessionDescription=>{
                  rtcPeerConnection.setLocalDescription(sessionDescription);
                  console.log('sending the answer',sessionDescription);
                  
                  socket.emit('answer',{
                      type:'answer',
                      sdp: sessionDescription,
                      room: roomNumber
                  });


                  
                  setCachedRemotePC(rtcPeerConnection);
                  
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
          setRemoteStream(event.streams[0]);
      };


      function onIceCandidate(event){
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
          const candidate = new RTCIceCandidate({
              sdpMLineIndex: event.label,
              candidate:event.candidate
          });
          console.log('reccived candidated', candidate);
          
          rtcPeerConnection.addIceCandidate(candidate);
      })


        
    const closeStreams = () => {
      console.log('clear');
      
      if (cachedLocalPC) {
        cachedLocalPC.removeStream(localStream);
        cachedLocalPC.close();
      }
      if (cachedRemotePC) {
        cachedRemotePC.removeStream(remoteStream);
        cachedRemotePC.close();
      }
      setLocalStream();
      setRemoteStream();
      setCachedRemotePC();
      setCachedLocalPC();
    };


    const startACall = () => {
      init();
    }
      
    console.log('localStream', localStream);
    

 
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.streamContainer}>
          <Text style={styles.roomTitle}>Connected to: {roomNumber} </Text>
          <View style={styles.streamWrapper}>
              <View style={styles.localStream}>
                {localStream && <RTCView style={styles.rtc} streamURL={localStream.toURL()} />}
              </View>
              <View style={styles.rtcview}>
                {remoteStream && <RTCView style={styles.rtc} streamURL={remoteStream.toURL()} />}
              </View>
            </View>
            {/* {localStream ? <Button title="Click to stop a call" onPress={closeStreams} /> : <Button title="Click to start a call" onPress={startACall} />} */}

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
