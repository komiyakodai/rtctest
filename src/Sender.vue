<template>
  <div>
    <div>
      <h1>Sender</h1>
      <div class="sbys">
      <div class="section">
        <h2>1. Offer</h2>
        <div class="description"><p>説明書き</p></div>
        <textarea class="textarea" cols="80" rows="10" disabled v-model="offerStr"></textarea>
        <button class="cope-button btn-square-pop" type="button" @click="copyOffer">copy</button>
      </div>
     

      
      <div class="section">
        <h2>2. Paste Answer</h2>
        <div class="description"><p>説明書き</p></div>
        <textarea class="textarea" cols="80" rows="10" :disabled="Boolean(answerStr)" v-model="answerStr"></textarea>
      </div>

      
      <div class="section">
        <h2>3. Sender Candidates</h2>
        <div class="description"><p>説明書き</p></div>
        <textarea class="textarea" disabled cols="80" rows="10" v-model="candidateStr"></textarea>
        <button class="cope-button btn-square-pop" type="button" @click="copySenderCandidates">copy</button>
      </div>
      <div class="section">
        <h2>4. Paste receiver candidates</h2>
          <div class="description"><p>説明書き</p></div>
          <textarea class="textarea" cols="80" rows="10" :disabled="Boolean(receiverCandidatesStr)" v-model="receiverCandidatesStr"></textarea>
        </div>
        </div>
    </div>
    <div class="connunicatearea">      
      <h3>{{channelOpen && !!localStream ? "配信中" : "配信準備中"}}</h3>
      <p v-if="!useMedia">カメラを許可してください</p>
      <video autoplay :srcObject.prop="localStream" style="background: black; width: 200px; height: 160px;"></video>
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
      text:undefined,
      useMedia: false
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

      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({audio: false, video: true})
        this.localStream.getTracks().forEach(track => this.connection.addTrack(track, this.localStream))
        this.useMedia = true
      } catch {
        this.localStream = undefined
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
    copyOffer(){
      this.text = document.getElementsByTagName("textarea")[0].value;
      navigator.clipboard.writeText(this.text)
    },
    copySenderCandidates(){
      this.text = document.getElementsByTagName("textarea")[2].value;
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
  padding :20px;
  flex-basis: 50%;
  box-sizing: border-box;
  /* background-color: lightgreen; */
}
.sbys
{
  display: flex;
  flex-wrap: wrap;
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
