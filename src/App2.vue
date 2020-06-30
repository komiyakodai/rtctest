<template>
  <div>
    <Sender/>
    
    <hr/>

    <Receiver/>
  </div>
</template>

<script>
import Sender from './Sender'
import Receiver from './Receiver'

export default {
  name: 'App',
  components: {
    Sender,
    Receiver,
  },
}
</script>