import { useAppDispatch, useAppSelector } from "../../../../hook/auth";
import { useCallback } from "react";
import {
  registerUser,
  clearErrorRegisMessage,
  clearRegisterState,
} from "../../../../store/reducers/authentication";
import { LOADED,LOADING,FAILED } from "../../../../store/reducers/const";
export const useRegisPlayer = () => {
  const dispatch = useAppDispatch();
  const message = useAppSelector((state) => state.auth.backendRegisMessage);
  const state = useAppSelector((state) => state.auth.registerState);
  const error = useAppSelector((state) => state.auth.errorRegister);

  // state 
  const isLoading = state === LOADING;
  const isLoaded = state === LOADED;
  const isFailed = state === FAILED;

  const registerPlayer = useCallback(
    (email: string, username: string, password: string) => {
      dispatch(registerUser({ email, username, password }));
      //console.log("สมัครสมาชิกเรียบร้อย");
    },
    [dispatch]
  );

  const clearBackendMessage = useCallback(() => {
    dispatch(clearErrorRegisMessage());
  }, [dispatch]);

  const clearStateRegister = useCallback(()=>{
    dispatch(clearRegisterState());
  },[dispatch])
  
  return {
    message,
    error,

    isLoading,
    isLoaded,
    isFailed,

    registerPlayer,
    clearBackendMessage,
    clearStateRegister,
  };
};
