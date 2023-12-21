import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        apiLoading: false,
        apiLoadMsg: 'Loading'
    },
    mutations: {
        updateApiLoading(state, apiLoading) {
            state.apiLoading = apiLoading
        },
        updateApiLoadMsg(state, apiLoadMsg) {
            state.apiLoadMsg = apiLoadMsg
        },
    }
})

export default store