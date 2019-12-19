import { createStore, combineReducers, applyMiddleware } from 'redux'
import reduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import axios from 'axios';

const userInitialState = {}

const USER_LAYOUT = 'user_layout'

const allReducers = combineReducers({
  user: userReducer
})

function userReducer(state = userInitialState, action) {
  switch (action.type) {
    case USER_LAYOUT: {
      return {}
    }
    default:
      return state
  }
}


export function logout() {
  return (dispatch) => {
    axios.post('/user/logout')
      .then(resp => {
        if (resp.status === 200) {
          dispatch({
            type: USER_LAYOUT
          })
        } else {
          console.log(resp.message)
        }
      })
  }
}

export default function initializeStore(state) {
  const store = createStore(
    allReducers,
    Object.assign({}, {user: userInitialState}, state),
    composeWithDevTools(applyMiddleware(reduxThunk))
    )

  return store
}


