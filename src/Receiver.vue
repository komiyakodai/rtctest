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
      <h2>6. Received data:</h2>
      <h3>{{channelOpen ? "受信中" : "受信準備中"}}</h3>
      <video autoplay :srcObject.prop="mediaStream" style="background: black; width: 200px; height: 160px;" muted></video>
      <p v-for="(msg, idx) in receivedMessages" :key="idx">{{msg}}</p>
    </div>
  </div>
</template>

<script>
import IceServerMixin from './IceServerMixin'
export default {
  mixins: [IceServerMixin],
  name: 'Receiver',
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
    connectPeers() {
      const config = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 0,
        iceServers: [{
          urls: this.iceServer,
        }]
      }
      this.connection = new RTCPeerConnection(config)
      this.connection.ondatachannel = this.receiveChannelCallback
      this.connection.ontrack = this.handleconnectionTrack

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
