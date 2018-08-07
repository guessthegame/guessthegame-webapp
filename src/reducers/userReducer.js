const initialState = {
  jwt: localStorage.getItem('jwt'),
  username: localStorage.getItem('username'),
};

export default function reducer(state = initialState, action) {
  const newState = { ...state };

  if (action.type === 'USER_LOG_IN') {
    localStorage.setItem('jwt', action.payload.jwt);
    if (action.payload.username) {
      localStorage.setItem('username', action.payload.username);
    }

    return {
      ...state,
      username: action.payload.username,
      jwt: action.payload.jwt,
    };
  }

  if (action.type === 'USER_LOG_OUT') {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    return {
      ...state,
      username: '',
      jwt: '',
    };
  }

  return newState;
}
