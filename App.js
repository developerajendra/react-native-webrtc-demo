/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React,{useState} from 'react';
import {View} from 'react-native';
import WEBRtc from './src/WEBRtc';
import {RTCRoom} from './src/RTCRoom';

const App: () => React$Node = () => {

  const [roomID, setRoom] = useState('')

  const getRoom  = (room)=>{
    setRoom(room);
  }

  return (
    <View>
      {!roomID ? <RTCRoom getRoom={getRoom}/> : null}
      {roomID ? <WEBRtc roomID={roomID} /> : null}
    </View>
  );
};
 
export default App;