<template>
  <div class="send">
    <form>
      <!-- <label for="name">氏名：</label> -->
      <p>Send</p>
      <input type="text" id="name" v-model="sendWord"/>
      <button type="button" v-on:click="onclick">ボタン</button>
    </form>
    <!-- <div>{{myName}}</div> -->
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data(){
    return{
      sendWord:''
    }
  },
  methods:{
    onclick(){
      this.$emit('show',this.sendWord)
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
