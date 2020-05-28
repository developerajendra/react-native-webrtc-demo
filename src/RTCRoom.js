import React, {useState} from 'react';
import {
    TextInput,
    View,
    StyleSheet,
    Button,
    Textarea
} from 'react-native';

export const RTCRoom = ({getRoom}) =>{
    const [room, setRoom] = useState('rajen');

    const createOrJoinRoom = ()=>{
        getRoom(room);
    }
    return(
        <View style={styles.roomContainer}>
            <View style={styles.roomWrapper}>
                <TextInput   placeholder='Include room name' style={styles.room} onChange={(e)=>{
                     setRoom(e.nativeEvent.text)
                }}></TextInput>
                <Button  style={styles.createRoom} title="Create or Join a Room" onPress={createOrJoinRoom}  />
                 
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    roomContainer:{
        backgroundColor: '#313131',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: '100%',
        flexDirection:'row',
       
    },
    roomWrapper:{
        width:'90%'
    },
    room:{
        borderColor:'#ccc',
        borderWidth:1,
        marginBottom:10,
        backgroundColor:'#ccc',
        paddingLeft:10
    }
});