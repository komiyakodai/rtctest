<template>
  <div class="app">
    <div class="buttons">
      <router-link class="btn-square-pop" :to="{name: 'sender'}" tag="button">sender</router-link>
      <router-link class="btn-square-pop" :to="{name: 'receiver'}" tag="button">receiver</router-link>
      <router-view class="content"></router-view>
    </div>
  </div>
</template>

<script>
import 'normalize.css'

export default {
  name: 'App',
  data() {
    return {
      
    }
  }
}
</script>


<style>
.app{
  background-color:#fffff0;
  margin: auto;
}

.content{
  margin: 10px;
}

.btn-square-pop {
  position: relative;
  display: inline-block;
  padding: 0.25em 0.5em;
  text-decoration: none;
  color: #FFF;
  background: #fd9535;/*背景色*/
  border-bottom: solid 2px #d27d00;/*少し濃い目の色に*/
  border-radius: 4px;/*角の丸み*/
  box-shadow: inset 0 2px 0 rgba(255,255,255,0.2), 0 2px 2px rgba(0, 0, 0, 0.19);
  font-weight: bold;
  outline: none;
}

.btn-square-pop:active {
  border-bottom: solid 2px #fd9535;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.30);
}

</style>