<template>
  <div id="app">
    <div id="buttons">
      <button type="button" id="start_button" @click="connectPeers">Start</button>
      <button type="button" id="send_button" @click="onSendMessage">Send</button>
      <button type="button" id="send_button" @click="onSendMessage2">Send2</button>
      <button type="button" id="stop_button">Stop</button>
    </div>
    <div id="textarea">
      <div id="sendarea">
        <h2>Send</h2>
        <textarea id="sendtext" cols="50" rows="10" v-model="sendMesage"></textarea>
      </div>
      <div id="recivearea">
        <h2>Receive</h2>
        <textarea id="receivetext" cols="50" rows="10" v-model="recvMessage"></textarea>
      </div>
    </div>

  </div>
</template>

<script>
//import Send from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    
   },
   data(){
    return {
      sendMesage: undefined,
      recvMessage: undefined,
      localConnection: undefined,
      sendChannel: undefined,
      remoteConnection: undefined,
      receiveChannel: undefined,
    }
  },
  methods:{
    onSendMessage() {
      this.sendChannel.send(this.sendMesage)
      this.sendMesage = ""
    },
    onSendMessage2() {
      this.receiveChannel.send(this.recvMessage)
      this.recvMessage = ""
    },
    connectPeers() {
      const config = {
        iceServers: [{
          urls: "stun:stun.l.google.com:19302",
        }]
      }
      this.localConnection = new RTCPeerConnection(config)

      this.sendChannel = this.localConnection.createDataChannel("sendChannel")
      this.sendChannel.onmessage = this.handleReceiveMessage2;
      this.sendChannel.onopen = this.handleSendChannelStatusChange
      this.sendChannel.onclose = this.handleSendChannelStatusChange

      this.remoteConnection = new RTCPeerConnection(config)
      this.remoteConnection.ondatachannel = this.receiveChannelCallback

      this.localConnection.onicecandidate = e => {
        console.log('localConnection.onicecandidate', e)
        !e.candidate
        || this.remoteConnection.addIceCandidate(e.candidate)
        .catch(this.handleAddCandidateError)
      }

      this.remoteConnection.onicecandidate = e => {
        console.log('remoteConnection.onicecandidate', e)
        !e.candidate
        || this.localConnection.addIceCandidate(e.candidate)
        .catch(this.handleAddCandidateError)
      }

      this.startConnection()
      console.log('onconnect')
    },
    startConnection() {
      this.localConnection.createOffer()
      .then(offer =>  {
        console.log('offer', offer)
        this.localConnection.setLocalDescription(offer)
        return offer
      })
      .then((offer) => {
        // console.log('offer2', offer, this.localConnection.localDescription)
        this.remoteConnection.setRemoteDescription(offer)
      })
      .then(() => {
        return this.remoteConnection.createAnswer()
      })
      .then(answer => {
        console.log('answer', answer)
        this.remoteConnection.setLocalDescription(answer)
      })
      .then(() => this.localConnection.setRemoteDescription(this.remoteConnection.localDescription))
      .catch(this.handleCreateDescriptionError);
    },
    handleSendChannelStatusChange(e) {
      console.log('handleSendChannelStatusChange', e)
    },
    receiveChannelCallback(e) {
      console.log('receiveChannelCallback', e, e.channel)

      this.receiveChannel = event.channel;
      this.receiveChannel.onmessage = this.handleReceiveMessage;
      this.receiveChannel.onopen = this.handleReceiveChannelStatusChange;
      this.receiveChannel.onclose = this.handleReceiveChannelStatusChange;
    },
    handleAddCandidateError(e) {
      console.log('handleAddCandidateError', e)
    },
    handleCreateDescriptionError(e) {
      console.log('handleCreateDescriptionError', e)
    },
    handleReceiveMessage(e) {
      console.log('handleReceiveMessage', e)
      this.recvMessage = e.data
    },
    handleReceiveMessage2(e) {
      console.log('handleReceiveMessage2', e)
      this.sendMesage = e.data
    },
    handleReceiveChannelStatusChange(e) {
      console.log('handleReceiveChannelStatusChange', e)
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  width:800px;
  height: 1000px;
  margin-top: 60px;
  padding-top: 100px;
  /* background-color: aqua; */
  margin: auto;
  
}
#buttons{
  
}

#start_button{
  background-color: red;
  color: aliceblue;
  width: 80px;
  height:35px;
  display:inline-block;
  margin: 0px 15px;
}
#send_button{
  background-color: red;
  color: aliceblue;
  width: 80px;
  height:35px;
  display:inline-block;
  margin: 0px 15px;
}
#stop_button{
  background-color: red;
  color: aliceblue;
  width: 80px;
  height:35px;
  display:inline-block;
  margin: 0px 15px;
}
#textarea{
  /* background-color: blueviolet; */
  height: 500px;
  
}

#sendarea{
  /* background-color: chartreuse; */
  width: 50%;
  display: inline-block;
  padding-top: 50px;

}
#recivearea{
  /* background-color: coral; */
  width: 50%;
  display: inline-block;
  padding-top: 50px;

}
#sendtext{
  width:80%;
}
#receivetext{
  width:80%;
}
</style>
