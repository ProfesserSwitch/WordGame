import {
  clearLoginState,
  loginUser,
    clearErrorLoginMessage,
} from "../../../../store/reducers/authentication";
import { LOADED,LOADING,FAILED } from "../../../../store/reducers/const";
import { useAppDispatch, useAppSelector } from "../../../../hook/auth";
import { useCallback } from "react";

export const useLoginPlayer = () => {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state)=> state.auth.currentUser);
  const message = useAppSelector((state) => state.auth.backendLoginMessage);
  const state = useAppSelector((state)=> state.auth.loginState);
  const error = useAppSelector((state)=> state.auth.errorLogin)


  //state 
  const isLoading = state === LOADING;
  const isLoaded  = state === LOADED;
  const isFailed = state === FAILED;


  const loginPlayer = useCallback(
    (username: string, password: string) => {
      return dispatch(loginUser({ username, password })).unwrap();
    },
    [dispatch]
  );

    const clearBackendMessage = useCallback(() => {
      dispatch(clearErrorLoginMessage());
    }, [dispatch]);

  const clearStateLogin = useCallback(()=>{
    dispatch(clearLoginState())
  },[dispatch])

  return {
    currentUser,
    message,
    error,
    
    isLoading,
    isFailed,
    isLoaded,

    loginPlayer,
    clearBackendMessage,
    clearStateLogin,
  };
};
