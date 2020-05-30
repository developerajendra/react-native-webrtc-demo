import React,{useEffect, Component} from 'react';
import {View, SafeAreaView, Button, StyleSheet} from 'react-native';

import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';

class WEBRtc extends Component {
   state = {
    localStream:null,
    remoteStream:null,
    cachedLocalPC:null,
    chedRemotePC:null
  }
 

    startLocalStream =  () => {
      mediaDevices.getUserMedia({
        audio:true,
        video:false
      }).then(newStream=>{
        this.setState({localStream:newStream}, ()=>{
          this.startCall();
        });
      }).catch(error=>console.log(error));
  };



    startCall =   () => {
    // You'll most likely need to use a STUN server at least. Look into TURN and decide if that's necessary for your project
    const configuration = {iceServers: [
      {'urls':'stun:stun.services.mozilla.com'},
      {'urls':'stun:stun.l.google.com:19302'}
    ]};

    const localPC = new RTCPeerConnection(configuration);
    const remotePC = new RTCPeerConnection(configuration);

    // could also use "addEventListener" for these callbacks, but you'd need to handle removing them as well
    localPC.onicecandidate = e => {
      if (e.candidate) {
        remotePC.addIceCandidate(e.candidate);
      }
    };

    remotePC.onicecandidate = e => {
      if (e.candidate) {
        localPC.addIceCandidate(e.candidate);
      }
    };
    
    remotePC.onaddstream = e => {
      if (e.stream && this.state.remoteStream !== e.stream) {
        this.setState({remoteStream:e.stream});
      }
    };

    
  localPC.addStream(this.state.localStream);

    return localPC.createOffer()
    .then(offer=>{
      return localPC.setLocalDescription(offer)
      .then(()=>{
        return remotePC.setRemoteDescription(localPC.localDescription)
        .then(()=>{
          return remotePC.createAnswer()
          .then(answer=>{
            return remotePC.setLocalDescription(answer)
            .then(()=>{
              return localPC.setRemoteDescription(remotePC.localDescription)
              .then(()=>{
                this.setState({cachedLocalPC:localPC});
                this.setState({chedRemotePC:remotePC});
              })
            })
          })
        });
        })
      })
  };

   closeStreams = () => {
     let {cachedLocalPC, localStream, cachedRemotePC, remoteStream} = this.state;
    if (cachedLocalPC) {
      cachedLocalPC.removeStream(localStream);
      cachedLocalPC.close();
    }
    if (cachedRemotePC) {
      cachedRemotePC.removeStream(remoteStream);
      cachedRemotePC.close();
    }
    this.setState({cachedLocalPC:null});
    this.setState({chedRemotePC:null});
    this.setState({remoteStream:null});
    this.setState({localStream:null});
  };
 
 

 render(){
   let {localStream, remoteStream} = this.state;
    return (
      <SafeAreaView style={styles.container}>
          <View style={styles.streamContainer}>
            <View style={styles.streamWrapper}>
                <View style={styles.localStream}>
                  {localStream && <RTCView style={styles.rtc} streamURL={localStream.toURL()} />}
                  {!localStream && <Button title="Tap to start" onPress={this.startLocalStream} />}
                </View>
                <View style={styles.rtcview}>
                  {remoteStream && <RTCView style={styles.rtc} streamURL={remoteStream.toURL()} />}
                </View>
              </View>
              {!!remoteStream ? <Button style={styles.toggleButtons} title="Click to stop call" onPress={this.closeStreams} disabled={!remoteStream} /> : localStream && <Button title="Click to start call" onPress={this.startCall}  />}
          </View>
      </SafeAreaView>
    );
  }
}
export default WEBRtc;




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
    justifyContent: 'space-evenly',
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
