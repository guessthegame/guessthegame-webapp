import { push } from 'connected-react-router';
import notificationService from '../../services/notificationService';

export default {
  login,
  logout,
  needToRegister,
};

function login(user) {
  return dispatch => {
    dispatch({ type: 'USER-LOG-IN', payload: user });
    dispatch(push('/'));
  };
}

function logout() {
  return dispatch => {
    dispatch({ type: 'USER-LOG-OUT' });
    dispatch(push('/connexion'));
  };
}

function needToRegister() {
  return dispatch => {
    notificationService.create({
      slug: 'loginAction-needRegister',
      text: 'Vous devez être inscrit pour accéder à cette partie du site.',
      type: 'error',
    });
    dispatch(push('/inscription'));
  };
}
