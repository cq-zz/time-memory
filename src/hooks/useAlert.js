import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AlertModal from '../components/common/AlertModal';

const AlertContext = createContext(null);
const _globalAlertRef = { current: null };

/**
 * Mount once near the app root. Renders a shared AlertModal and exposes
 * alert() via useAlert() (or globalAlert() outside React trees).
 */
export function AlertProvider({ children }) {
  const [alertState, setAlertState] = useState(null);

  const show = useCallback((titleOrConfig, message, buttons) => {
    if (typeof titleOrConfig === 'string') {
      setAlertState({ title: titleOrConfig, message, type: 'tip', buttons });
    } else {
      setAlertState({
        title: '',
        message: '',
        type: 'tip',
        buttons: undefined,
        ...titleOrConfig,
      });
    }
  }, []);

  const close = useCallback(() => setAlertState(null), []);

  useEffect(() => {
    _globalAlertRef.current = show;
    return () => { _globalAlertRef.current = null; };
  }, [show]);

  return (
    <AlertContext.Provider value={show}>
      {children}
      {/* Mounted on demand: react-native-web stacks Modal portals by mount
          order, so a fresh mount lands on top of any open sheet modal. */}
      {alertState ? (
        <AlertModal
          visible
          onClose={close}
          title={alertState.title}
          message={alertState.message}
          type={alertState.type}
          buttons={alertState.buttons}
        />
      ) : null}
    </AlertContext.Provider>
  );
}

export default function useAlert() {
  const show = useContext(AlertContext);
  return {
    alert: useCallback((...args) => show?.(...args), [show]),
  };
}

export function globalAlert(...args) {
  _globalAlertRef.current?.(...args);
}
