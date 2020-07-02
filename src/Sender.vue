<template>
  <div>
    <div>
      <h1>Sender</h1>
      <h2>1. Offer</h2>
      <div class="offer-area">
      <textarea disabled cols="80" rows="10" v-model="offerStr" class="textarea"></textarea>
      <p class="description">説明書き説明書き説明書き説明書き説明書き説明書き説明書き説明書き説明書き説明書き説明書き説明書き説明書き説明書き</p>
      </div>

      <h2>2. Paste Answer</h2>
      <textarea cols="80" rows="10" :disabled="Boolean(answerStr)" v-model="answerStr"></textarea>
      <h2>3. Sender Candidates</h2>
      <textarea disabled cols="80" rows="10" v-model="candidateStr"></textarea>
      <h2>4. Paste receiver candidates</h2>
      <textarea cols="80" rows="10" :disabled="Boolean(receiverCandidatesStr)" v-model="receiverCandidatesStr"></textarea>
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
  name: 'Sender',
  //props: {
    //iceServer: { type: String }
  //},
  data(){
    return {
      sendMesage: undefined,
      receivedMessages: [],
      recvMessage: undefined,
      connection: undefined,
      candidate: undefined,
      channel: undefined,
      offer: undefined,
      answerStr: undefined,
      receiveChannel: undefined,
      candidates: [],
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
    answerStr(answer) {
      this.connection.setRemoteDescription(JSON.parse(answer))
    },
    receiverCandidatesStr(str) {
      const candidates = JSON.parse(str)
      candidates.forEach(candidate => {
        console.log('Sender adding candidate', candidate)
        this.connection.addIceCandidate(candidate).catch((e) => {
          console.eror('Sender addIceCandidate error', e)
        })
      })
    },
  },
  computed: {
    candidateStr() {
      return JSON.stringify(this.candidates)
    },
    offerStr() {
      return JSON.stringify(this.offer)
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
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceServers: [{
          urls: this.iceServer
        }]
      }
      this.connection = new RTCPeerConnection(config)
      this.connection.ontrack = e => {
        console.log("ontrack")
        this.mediaStream = e.streams[0]
      }
      this.channel = this.connection.createDataChannel("channel")
      this.channel.onmessage = this.handleMessage;
      this.channel.onopen = this.handlechannelStatusChange
      this.channel.onclose = this.handlechannelStatusChange

      this.connection.onicecandidate = e => {
        if (e.candidate) {
          this.candidates.push(e.candidate)
        }
      }

      this.startConnection()
      console.log('onconnect')
    },
    startConnection() {
      this.connection.createOffer()
      .then(offer =>  {
        this.offer = offer
        this.connection.setLocalDescription(offer)
      })
    },
    handleconnectionTrack(e) {
      console.log("handleconnectionTrack")
      this.mediaStream = e.streams[0]
    },
    handlechannelStatusChange(e) {
      console.log('handlechannelStatusChange', e)
      if (e.type === 'open') {
        this.channelOpen = true
      } else if (e.type === 'close') {
        this.channelOpen = false
      }
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
    handleReceiveChannelStatusChange(e) {
      console.log('handleReceiveChannelStatusChange', e)
    },
  }
}
</script>

<style>
.textarea{
  float: left;
  width: 50%;
}
.description{
  float:right;
  background-color: lightcoral;
  width: 45%;
  height: 100%;
}
h2{
  clear: both;
}
</style>
