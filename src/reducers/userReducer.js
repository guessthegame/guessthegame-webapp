const initialState = {
  jwt: localStorage.getItem('jwt'),
  username: localStorage.getItem('username'),
  userData: null,
  solvedScreenshots: null,
  addedScreenshots: null,
  canModerateScreenshots:
    localStorage.getItem('canModerateScreenshots') === '1',
  lastViewedRandomScreenshots: [],
};

export default function reducer(state = initialState, action) {
  const newState = { ...state };
  const { type, payload } = action;

  if (type === 'USER_LOG_IN') {
    localStorage.setItem('jwt', payload.jwt);
    if (payload.username) {
      localStorage.setItem('username', payload.username);
      localStorage.setItem(
        'canModerateScreenshots',
        payload.canModerateScreenshots
      );
    }

    return {
      ...state,
      username: payload.username,
      jwt: payload.jwt,
      canModerateScreenshots: payload.canModerateScreenshots,
    };
  }

  if (type === 'USER_LOG_OUT') {
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    return {
      ...state,
      username: '',
      jwt: '',
    };
  }

  if (type === 'USER_DATA_LOADING') {
    return {
      ...state,
      userData: null,
    };
  }

  if (type === 'USER_DATA_LOADED') {
    return {
      ...state,
      userData: payload,
    };
  }

  if (type === 'USER_SOLVED-SCREENSHOTS_LOADED') {
    return {
      ...state,
      solvedScreenshots: payload.map(screenshot => ({
        ...screenshot,
        createdAt: new Date(screenshot.createdAt),
        solvedAt: new Date(screenshot.solvedAt),
      })),
    };
  }

  if (type === 'USER_ADDED-SCREENSHOTS_LOADED') {
    return {
      ...state,
      addedScreenshots: payload.map(screenshot => ({
        ...screenshot,
        createdAt: new Date(screenshot.createdAt),
      })),
    };
  }

  if (type === 'USER_UPDATE') {
    return {
      ...state,
      userData: {
        ...state.userData,
        ...payload,
      },
    };
  }

  if (type === 'SCREENSHOT_LOAD' && !payload.error) {
    // Si la screenshot retournée est déjà dans notre liste, on recommence la liste
    if (state.lastViewedRandomScreenshots.indexOf(payload.id) !== -1) {
      return {
        ...state,
        lastViewedRandomScreenshots: [payload.id],
      };
    }
    // Si le nombre de screenshots dépasse la limite, on supprime la première avant de rajouter la nouvelle
    if (state.lastViewedRandomScreenshots.length > 200) {
      return {
        ...state,
        lastViewedRandomScreenshots: state.lastViewedRandomScreenshots
          .slice(1)
          .concat([payload.id]),
      };
    }
    // Sinon, on ajoute la nouvelle screenshot à la liste des screenshots vues
    return {
      ...state,
      lastViewedRandomScreenshots: state.lastViewedRandomScreenshots.concat([
        payload.id,
      ]),
    };
  }

  return newState;
}
