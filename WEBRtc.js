import React, { useState, useEffect } from 'react';
import {View} from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices
} from 'react-native-webrtc';

export default function WEBRtc (props) {
  const [localStream, setLocalStream] = useState(undefined)
  useEffect(function () {
    mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height and frame rate here
          minHeight: 300,
          minFrameRate: 30
        },
        facingMode: "environment",
        optional: []
      }
    }).then(setLocalStream);
  }, [])
  console.log('render', localStream && localStream.toURL())
  return (
    <View>
      {localStream && <RTCView style={{flex:1}} streamURL={localStream.toURL()}/>}
    </View>
  );
}










// import React, { Component } from 'react';
// // import { Platform } from 'react-native';
// import {
//     SafeAreaView,
//     StyleSheet,
//     ScrollView,
//     View,
//     Text,
//     StatusBar,
//   } from 'react-native';
// import {
//     RTCPeerConnection,
//     RTCMediaStream,
//     RTCIceCandidate,
//     RTCSessionDescription,
//     RTCView,
//     MediaStreamTrack,
//     getUserMedia,
//     mediaDevices,
// } from 'react-native-webrtc';
 

// class WEBRtc extends Component {
//     // Initial state
//     state = {
//         stream: '',
//         isFront: true
//     }

//     componentDidMount() {
        

//         const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
//         const pc = new RTCPeerConnection(configuration);

//         let isFront = true;
//         mediaDevices.enumerateDevices().then(sourceInfos => {
             
//         console.log('sourceInfos',sourceInfos);
//         let videoSourceId;
//         for (let i = 0; i < sourceInfos.length; i++) {
//             const sourceInfo = sourceInfos[i];
//             if(sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
//             videoSourceId = sourceInfo.deviceId;
//             }
//         }
//         mediaDevices.getUserMedia({
//             audio: true,
//             video: {
//             mandatory: {
//                 minWidth: 500, // Provide your own width, height and frame rate here
//                 minHeight: 300,
//                 minFrameRate: 30
//             },
//             facingMode: (isFront ? "user" : "environment"),
//             optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
//             }
//         })
//         .then(stream => {
//             // Got stream!
//             this.setState({ stream: stream.toURL() });
//         })
//         .catch(error => {
//             // Log error
//         });
//         });

//         pc.createOffer().then(desc => {
//         pc.setLocalDescription(desc).then(() => {
//             // Send pc.localDescription to peer
//         });
//         });

//         pc.onicecandidate = function (event) {
//         // send event.candidate to peer
//         };
 
         
//     }

//     render() {
          
//         return (
//                 <RTCView  style={{flex:1}}  objectFit={'contain'} zOrder={1} streamURL={this.state.stream}/>
//         );
//     }
// }
// const styles = {
//     container: {
//         flex: 3,
//         backgroundColor: '#ccc',
//         borderWidth: 1,
//         borderColor: '#000'
//     }
// };

// export default WEBRtc;
