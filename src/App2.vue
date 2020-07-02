<template>
  <div class="app">
    <router-link :to="{name: 'sender'}" tag="button">sender</router-link>
    <router-link :to="{name: 'receiver'}" tag="button">receiver</router-link>
    <router-link to="/" tag="button">index</router-link>
    <router-view class="content"></router-view>
  </div>
</template>

<script>

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
  background-color: rgb(197, 242, 178);
  width: 1000px;
  margin: auto;
}

.content{
  margin: 100px;
}

</style>