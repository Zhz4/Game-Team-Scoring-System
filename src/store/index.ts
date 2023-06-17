import { createStore, Commit } from "vuex";

interface State {
    message: object | null;
    websocket: WebSocket | null;
    sign:number // 判断是房主还是房员
}

const store = createStore<State>({
    state: {
        websocket: null,
        message:null,
        sign:0
    },
    getters: {
        getWebSocketUrl(): string {
            return 'ws://localhost:8000'
        }
    },
    mutations: {
        SET_WEBSOCKET(state: State, value: WebSocket) {
            state.websocket = value
        },
        SET_SIGN(state:State,value:number){
            state.sign = value
        }
    },
    actions: {
        connectWebSocket({ commit }: { commit: Commit },url): WebSocket | void {
            const socket = new WebSocket(url)
            console.log(socket)
            socket.onopen = (event) => {
                console.log('WebSocket 连接已打开', event)
                commit('SET_WEBSOCKET', socket)
            }
            // return socket
        },

    },
    modules: {},
})

export default store;
