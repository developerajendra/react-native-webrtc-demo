import React, {useState, useEffect} from 'react';
import {View, SafeAreaView, Button, StyleSheet, Text} from 'react-native';
import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';
import io from "socket.io-client";

export default function WEBRtc({roomID}) {
  const [localStream, setLocalStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [cachedLocalPC, setCachedLocalPC] = useState();
  const [cachedRemotePC, setCachedRemotePC] = useState();

    

  const startLocalStream = async () => {
     
    const socket = io("http://192.168.10.90:3000");
    socket.emit('socketConnected', roomID);

    // isFront will determine if the initial camera should face user or environment
    const isFront = true;
    const devices = await mediaDevices.enumerateDevices();

    const facing = isFront ? 'front' : 'environment';
    const videoSourceId = devices.find(device => device.kind === 'videoinput' && device.facing === facing);
    const facingMode = isFront ? 'user' : 'environment';
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          minWidth: 0, // Provide your own width, height and frame rate here
          minHeight: 300,
          minFrameRate: 30,
        },
        facingMode,
        optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
      },
    };
    const newStream = await mediaDevices.getUserMedia(constraints);
    
     
    socket.on('roomCreated', room=>{
      setLocalStream(newStream);
    });

    socket.on('roomJoined', room=>{
      setLocalStream(newStream);
      socket.emit('ready', roomNumber)
    })

  };

  useEffect(()=>{
    startLocalStream();
  });
  

  const startCall = async () => {
    // You'll most likely need to use a STUN server at least. Look into TURN and decide if that's necessary for your project
    const configuration = {iceServers: [
      {'urls':'stun:stun.services.mozilla.com'},
      {'urls':'stun:stun.l.google.com:19302'}
    ]};

    const localPC = new RTCPeerConnection(configuration);
    const remotePC = new RTCPeerConnection(configuration);

    // could also use "addEventListener" for these callbacks, but you'd need to handle removing them as well
    localPC.onicecandidate = e => {
      try {
        console.log('localPC icecandidate:', e.candidate);
        if (e.candidate) {
          remotePC.addIceCandidate(e.candidate);
        }
      } catch (err) {
        console.error(`Error adding remotePC iceCandidate: ${err}`);
      }
    };
    remotePC.onicecandidate = e => {
      try {
        console.log('remotePC icecandidate:', e.candidate);
        if (e.candidate) {
          localPC.addIceCandidate(e.candidate);
        }
      } catch (err) {
        console.error(`Error adding localPC iceCandidate: ${err}`);
      }
    };
    remotePC.onaddstream = e => {
      console.log('remotePC tracking with ', e);
      if (e.stream && remoteStream !== e.stream) {
        console.log('RemotePC received the stream', e.stream);
        setRemoteStream(e.stream);
      }
    };

    // AddTrack not supported yet, so have to use old school addStream instead
    // newStream.getTracks().forEach(track => localPC.addTrack(track, newStream));
    localPC.addStream(localStream);
    try {
      const offer = await localPC.createOffer();
      console.log('Offer from localPC, setLocalDescription');
      await localPC.setLocalDescription(offer);
      console.log('remotePC, setRemoteDescription');
      await remotePC.setRemoteDescription(localPC.localDescription);
      console.log('RemotePC, createAnswer');
      const answer = await remotePC.createAnswer();
      console.log(`Answer from remotePC: ${answer.sdp}`);
      console.log('remotePC, setLocalDescription');
      await remotePC.setLocalDescription(answer);
      console.log('localPC, setRemoteDescription');
      await localPC.setRemoteDescription(remotePC.localDescription);
    } catch (err) {
      console.error(err);
    }
    setCachedLocalPC(localPC);
    setCachedRemotePC(remotePC);
  };

  const closeStreams = () => {
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

 
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.streamContainer}>
          <Text style={styles.roomTitle}>Connected to: {roomID}</Text>
          <View style={styles.streamWrapper}>
              <View style={styles.localStream}>
                {localStream && <RTCView style={styles.rtc} streamURL={localStream.toURL()} />}
                {/* {!localStream && <Button title="Tap to start" onPress={startLocalStream} />} */}
              </View>
              <View style={styles.rtcview}>
                {remoteStream && <RTCView style={styles.rtc} streamURL={remoteStream.toURL()} />}
              </View>
            </View>
            {!!remoteStream ? <Button style={styles.toggleButtons} title="Click to stop call" onPress={closeStreams} disabled={!remoteStream} /> : localStream && <Button title="Click to start call" onPress={startCall}  />}
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
