import axios from 'axios'
import { clearCart, getCartProducts, newErrorMessage } from './index'

/**
 * ACTION TYPES
 */
const GET_USER = 'GET_USER'
const SET_CURRENT_USER = 'SET_CURRENT_USER';
const REMOVE_USER = 'REMOVE_USER'

/**
 * INITIAL STATE
 */
const defaultUser = {}

/**
 * ACTION CREATORS
 */
const getUser = user => ({
  type: GET_USER,
  user
})

const setCurrentUser  = user => ({
  type: SET_CURRENT_USER,
  user
});

const removeUser = () => ({
  type: REMOVE_USER
})

/**
 * THUNK CREATORS
 */
export const me = () =>
  dispatch =>
    axios.get('/auth/me')
      .then(res =>
        dispatch(getUser(res.data || defaultUser)))
      .catch(err => console.log(err))

export const auth = (email, password, username, name, method) => {
  return dispatch =>
    axios.post(`/auth/${method}`, { email, password, username, name })
      .then(res => {
        dispatch(getUser(res.data))
        dispatch(getCartProducts(res.data.recentCart))
        history.push('/home')
      }, authError => { // rare example: a good use case for parallel (non-catch) error handler
        dispatch(getUser({error: authError}))
      })
      .catch(dispatchOrHistoryErr => console.error(dispatchOrHistoryErr))
    }

export const login = (credentials, history) => dispatch => {
  axios.post('/auth/login', credentials)
    .then(res => setUserAndRedirect(res.data, history, dispatch))
    .catch(err => {
      dispatch(newErrorMessage("Login Unsuccessful- "+ err.response.data))
      console.error(`Logging in with ${credentials.email} and ${credentials.password} was unsuccesful`, err.response.data)
    })
};


export const signup = (credentials, history) => dispatch => {
  axios.post('/auth/signup', credentials)
    .then(res => setUserAndRedirect(res.data, history, dispatch))
    .catch(err => {
      dispatch(newErrorMessage("Sign Up Unsuccessful- " + err.response.data))
      console.error(`Signing up with ${credentials.email} and ${credentials.password} was unsuccesful`, err.response.data)}
    );
};

export const logout = (user) =>
  dispatch =>
    axios.post('/auth/logout', user)
      .then(_ => {
        dispatch(removeUser())
        dispatch(clearCart())
      })
      .then(() => history.push('/login'))
      .catch(err => console.log(err))

/**
 * REDUCER
 */
export default function (state = defaultUser, action) {
  switch (action.type) {
    case GET_USER:
      return action.user
    case SET_CURRENT_USER:
      return action.user;
    case REMOVE_USER:
        return defaultUser
    default:
      return state
  }
}

/* ------------      HELPER FUNCTIONS     ------------------ */

function setUserAndRedirect (user, history, dispatch) {
  dispatch(setCurrentUser(user))
  history.push(`/`);
}
