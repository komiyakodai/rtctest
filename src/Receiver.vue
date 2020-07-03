<template>
  <div>
    <div>
      <h1>Receiver</h1>
      <div class="sbys">
      <div class="section">
        <h2>1. Paste offer</h2>
        <div class="description"><p>説明書き</p></div>
        <textarea class="textarea" cols="50" rows="10" :disabled="Boolean(offerStr)"  v-model="offerStr"></textarea>
      </div>

      
      <div class="section">
        <h2>2. Answer</h2>
        <div class="description"><p>説明書き</p></div>
        <textarea class="textarea" disabled cols="50" rows="10" v-model="answerStr"></textarea>
        <!-- <button class="cope-button btn-square-pop" type="button" @click="copyAnswer">copy</button> -->
      </div>

      
      <div class="section">
        <h2>3. Paste sender candidates</h2>
        <div class="description"><p>説明書き</p></div>
        <textarea class="textarea" cols="50" rows="10" :disabled="Boolean(receiverCandidatesStr)" v-model="receiverCandidatesStr"></textarea>
      </div>

     
      <div class="section">
        <h2>4. Receiver Candidates</h2>
        <div class="description"><p>説明書き</p></div>
        <textarea class="textarea" disabled cols="50" rows="10" v-model="candidateStr"></textarea>
        <!-- <button class="cope-button btn-square-pop" type="button" @click="copyReceiverCandidates">copy</button> -->
      </div>
      </div>
      <div class="connunicatearea">
      <div class="sbys">
      <div class="sendarea">
      <h2>5. Send</h2>
      <form @submit.prevent="onSendMessage">
        <input type="text" cols="50" rows="10" v-model="sendMesage"/>
        <button class="btn-square-pop" type="submit"
          :disabled="!channelOpen">Send</button>
      </form>
      </div>
      <h2>6. Received data:</h2>
       <p v-for="(msg, idx) in receivedMessages" :key="idx">{{msg}}</p>
      </div>
      <h3>{{channelOpen ? "受信中" : "受信準備中"}}</h3>
      <video autoplay :srcObject.prop="mediaStream" style="background: black; width: 200px; height: 160px;" muted></video>
      </div>
    </div>
  </div>
</template>

<script>
import 'normalize.css'
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
      text:undefined,
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
     copyAnswer(){
      this.text = document.getElementsByTagName("textarea")[1].value;
      navigator.clipboard.writeText(this.text)
    },
    copyReceiverCandidates(){
      this.text = document.getElementsByTagName("textarea")[3].value;
      navigator.clipboard.writeText(this.text)
    }
  }
}
</script>

<style scoped>

.textarea{
  resize: none;
  width:100%;
  height:30px;
  padding: 0;
  border-radius: 5px;
}
.description{
  background-color: rgb(255, 255, 255);
  width: 100%;
  height: 162px;
  margin:0;
  border-radius: 15px;
  padding: 0px;
  background-color: lightgoldenrodyellow;
  margin-bottom: 10px;
}
.offer-area{
  height: 130px;
}
.section{
  height: 300px;
  margin :20px;
  /* background-color: lightgreen; */
}
.sbys
{
  display: flex;
}
.video{
  margin-right :10px;
}
.sendarea{
  margin-right: 100px;
}
.connectarea{
  margin-bottom: 60px;
}
p{
  padding: 10px;
}
.connunicatearea{
  margin: 0 20px 0 20px;
  padding-bottom: 100px;
}
</style>
