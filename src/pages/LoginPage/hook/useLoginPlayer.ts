import {
  loginUser,
//   clearErrorLoginMessage,
} from "../../../store/reducers/authentication";

import { useAppDispatch, useAppSelector } from "../../../hook/auth";
import { useCallback } from "react";

export const useLoginPlayer = () => {
  const dispatch = useAppDispatch();
  const playerLogin = useAppSelector((state) => state.auth.playerLogin);
  const message = useAppSelector((state) => state.auth.backendLoginMessage);
  const loading = useAppSelector((state) => state.auth.LoginState);

  //console.log("playerLogin state:", playerLogin);
  console.log("message state:", message);
  //console.log("loading state:", loading);

  const loginPlayer = useCallback(
    (username: string, password: string) => {
      dispatch(loginUser({ username, password }));
    },
    [dispatch]
  );

//   const clearBackendMessage = useCallback(() => {
//     dispatch(clearErrorLoginMessage());
//   }, [dispatch]);

  return {
    playerLogin,
    message,
    loading,
    loginPlayer,
    // clearBackendMessage,
  };
};
