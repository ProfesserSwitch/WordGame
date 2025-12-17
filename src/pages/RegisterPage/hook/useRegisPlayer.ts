import { useAppDispatch,useAppSelector } from "../../../hook/auth";
import { useCallback,} from "react";
import { registerUser , clearErrorRegisMessage } from "../../../store/reducers/authentication";

export const useRegisPlayer = () => {
    const dispatch = useAppDispatch();
    const player = useAppSelector((state) => state.auth.playRegister);
    const message = useAppSelector((state) => state.auth.backendRegisMessage);
    const loading = useAppSelector((state) => state.auth.registerState);

    //console.log("loading state:", loading);



  const registerPlayer = useCallback((email:string,username: string, password: string) => {
    dispatch(registerUser({ email, username, password }));
    //console.log("สมัครสมาชิกเรียบร้อย");
  }, [dispatch]);

  const clearBackendMessage = useCallback(() => {
    dispatch(clearErrorRegisMessage());
  }, [dispatch]);


    return {
      player,
      message,
      loading,

      registerPlayer,
      clearBackendMessage,
    }
}