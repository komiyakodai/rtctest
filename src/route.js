
import Vue from 'vue'
import VueRouter from "vue-router"
import Sender from "./Sender.vue"
import Receiver from "./Receiver.vue"

Vue.use(VueRouter)

const routes = [
    {
        path: '/sender',
        component: Sender,
        name: 'sender',
        props: true
     },
     {
         path: '/receiver',
         component: Receiver,
         name: 'receiver',
         props: true
      },
      { 
          path: '/', 
          redirect: '/sender' 
      },
]

const router = new VueRouter({
    routes: routes
})

export default router