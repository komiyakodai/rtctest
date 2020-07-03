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
      <h3>{{channelOpen ? "配信中" : "配信準備中"}}</h3>
      <video autoplay :srcObject.prop="localStream" style="background: black; width: 200px; height: 160px;"></video>
      <h2>6. Received data:</h2>
      <p v-for="(msg, idx) in receivedMessages" :key="idx">{{msg}}</p>
    </div>
  </div>
</template>

<script>
import IceServerMixin from './IceServerMixin'
export default {
  mixins: [IceServerMixin],
  name: 'Sender',
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
    async connectPeers() {
      this.localStream = await navigator.mediaDevices.getUserMedia({audio: false, video: true})
      const config = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0,
        iceServers: [{
          urls: this.iceServer
        }]
      }
      this.connection = new RTCPeerConnection(config)
      this.channel = this.connection.createDataChannel("channel")
      this.channel.onmessage = this.handleMessage;
      this.channel.onopen = this.handlechannelStatusChange
      this.channel.onclose = this.handlechannelStatusChange

      this.connection.onicecandidate = e => {
        if (e.candidate) {
          this.candidates.push(e.candidate)
        }
      }

      this.localStream.getTracks().forEach(track => this.connection.addTrack(track, this.localStream))

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
