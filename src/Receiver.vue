<template>
  <div>
    <div>
      <h1>Receiver</h1>
      <h2>1. Paste offer</h2>
      <textarea cols="50" rows="10" :disabled="Boolean(offerStr)"  v-model="offerStr"></textarea>
      <h2>2. Answer</h2>
      <textarea disabled cols="50" rows="10" v-model="answerStr"></textarea>
      <h2>3. Paste sender candidates</h2>
      <textarea cols="50" rows="10" :disabled="Boolean(receiverCandidatesStr)" v-model="receiverCandidatesStr"></textarea>
      <h2>4. Receiver Candidates</h2>
      <textarea disabled cols="50" rows="10" v-model="candidateStr"></textarea>
      <h2>5. Send</h2>
      <form @submit.prevent="onSendMessage">
        <input type="text" cols="50" rows="10" v-model="sendMesage"/>
        <button type="submit"
          :disabled="!channelOpen">Send</button>
      </form>
      <h3>配信中</h3>
      <video autoplay :srcObject.prop="localStream" style="background: black"></video>
      <button v-on:click="onStreamMedia" :disabled="!channelOpen">Start</button>
      <button v-on:click="stopStreamMedia" :disabled="!channelOpen">Stop</button>
      <h2>6. Received data:</h2>
      <p v-for="(msg, idx) in receivedMessages" :key="idx">{{msg}}</p>
      <h3>受信中</h3>
      <video autoplay :srcObject.prop="mediaStream" style="background: black"></video>
    </div>
  </div>
</template>

<script>
import IceServerMixin from './IceServerMixin'
export default {
  mixins: [IceServerMixin],
  name: 'Receiver',
  // props: {
  //   iceServer: {type: String}
  // },
  data(){
    return {
      offerStr: undefined,
      answer: undefined,
      sendMesage: undefined,
      receivedMessages: [],
      connection: undefined,
      candidates: [],
      channel: undefined,
      offer: undefined,
      receiveChannel: undefined,
      receiverCandidatesStr: undefined,
      channelOpen: false,
      localStream: undefined, // 送信するストリーム
      mediaStream: undefined, // 受信したストリーム
    }
  },
  mounted() {
    this.connectPeers()
  },
  watch: {
    async offerStr(offer) {
      await this.connection.setRemoteDescription(JSON.parse(offer))
      this.answer = await this.connection.createAnswer()
      this.connection.setLocalDescription(this.answer)
    },
    receiverCandidatesStr(str) {
      const candidates = JSON.parse(str)
      candidates.forEach(candidate => {
        console.log('Receiver adding candidate', candidate)
        this.connection.addIceCandidate(candidate).catch((e) => {
          console.eror('Receiver addIceCandidate error', e)
        })
      })
    }
  },
  computed: {
    answerStr() {
      return JSON.stringify(this.answer)
    },
    candidateStr() {
      return JSON.stringify(this.candidates)
    },
  },
  methods:{
    onSendMessage() {
      this.channel.send(this.sendMesage)
      this.sendMesage = ""
    },
    async onStreamMedia() {
      this.localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
      // this.channel.send(this.localStream)
      this.localStream.getTracks().forEach(track => {
        this.connection.addTrack(track, this.localStream)
      })
    },
    async stopStreamMedia() {
      if(this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop())
        this.localStream = undefined
      }
    },
    connectPeers() {
      const config = {
        iceServers: [{
          urls: this.iceServer,
        }]
      }
      this.connection = new RTCPeerConnection(config)
      this.connection.ontrack = e => {
        console.log("ontrack")
        this.mediaStream = e.streams[0]
      }
      this.connection.ondatachannel = this.receiveChannelCallback

      this.connection.onicecandidate = e => {
        console.log("receiver candidate", e.candidate)
        if (e.candidate) {
          this.candidates.push(e.candidate)
        }
      }

      console.log('onconnect')
    },
    receiveChannelCallback(e) {
      this.channel = e.channel;
      this.channel.onmessage = this.handleMessage;
      this.channel.onopen = this.handlechannelStatusChange
      this.channel.onclose = this.handlechannelStatusChange
    },
    handleconnectionTrack(e) {
      console.log("handleconnectionTrack")
      this.mediaStream = e.streams[0]
    },
    handleAddCandidateError(e) {
      console.log('handleAddCandidateError', e)
    },
    handleCreateDescriptionError(e) {
      console.log('handleCreateDescriptionError', e)
    },
    handleMessage(e) {
      console.log('handleMessage', e)
      this.receivedMessages.push(e.data)
    },
    handlechannelStatusChange(e) {
      console.log('handlechannelStatusChange', e)
      if (e.type === 'open') {
        this.channelOpen = true
      } else if (e.type === 'close') {
        this.channelOpen = false
      }
    },
  }
}
</script>
