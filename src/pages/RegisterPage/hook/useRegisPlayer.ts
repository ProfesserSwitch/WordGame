import { useAppDispatch,useAppSelector } from "../../../hook/auth";
import { useCallback,} from "react";
import { registerUser , clearErrorRegisMessage } from "../../../store/reducers/authentication";

export const useRegisPlayer = () => {
    const dispatch = useAppDispatch();
    const message = useAppSelector((state) => state.auth.backendRegisMessage);
    const loading = useAppSelector((state) => state.auth.registerState);


  const registerPlayer = useCallback((email:string,username: string, password: string) => {
    dispatch(registerUser({ email, username, password }));
    //console.log("สมัครสมาชิกเรียบร้อย");
  }, [dispatch]);

  const clearBackendMessage = useCallback(() => {
    dispatch(clearErrorRegisMessage());
  }, [dispatch]);


    return {

      message,
      loading,

      registerPlayer,
      clearBackendMessage,
    }
}