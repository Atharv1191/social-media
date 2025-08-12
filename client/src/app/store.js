
import {configureStore} from "@reduxjs/toolkit"
import userReducer from '../Features/User/userSlice'
import connectionsReducer from '../Features/connections/connectionsSlice'
import messageReducer  from '../Features/Messages/MessagesSlice'

export const store = configureStore({
    reducer:{
        user:userReducer,
        connections:connectionsReducer,
        messages:messageReducer

    }
})