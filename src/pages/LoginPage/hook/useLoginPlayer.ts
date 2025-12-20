import {
  loginUser,
  //   clearErrorLoginMessage,
} from "../../../store/reducers/authentication";

import { useAppDispatch, useAppSelector } from "../../../hook/auth";
import { useCallback } from "react";

export const useLoginPlayer = () => {
  const dispatch = useAppDispatch();
  const playerLogin = useAppSelector((state) => state.auth.currentUserLogin)
  const message = useAppSelector((state) => state.auth.backendLoginMessage);
  const loading = useAppSelector((state) => state.auth.LoginState);
  const loadingSuccess = useAppSelector((state) => state.auth.loginSuccess);
  //console.log("playerLogin state:", playerLogin);
  //console.log("loading state:", loading);
  console.log("Login :",playerLogin)
  const loginPlayer = useCallback(
    (username: string, password: string) => {
      return dispatch(loginUser({ username, password })).unwrap();
    },
    [dispatch]
  );

  //   const clearBackendMessage = useCallback(() => {
  //     dispatch(clearErrorLoginMessage());
  //   }, [dispatch]);

  return {
    message,
    loading,
    loadingSuccess,
    loginPlayer,
    // clearBackendMessage,
  };
};
