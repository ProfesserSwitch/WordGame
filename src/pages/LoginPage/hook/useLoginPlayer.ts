import {
  loginUser,
  //   clearErrorLoginMessage,
} from "../../../store/reducers/authentication";

import { useAppDispatch, useAppSelector } from "../../../hook/auth";
import { useCallback } from "react";

export const useLoginPlayer = () => {
  const dispatch = useAppDispatch();

  const message = useAppSelector((state) => state.auth.backendLoginMessage);
  const loading = useAppSelector((state) => state.auth.loginLoading);


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
   
    loginPlayer,
    // clearBackendMessage,
  };
};
