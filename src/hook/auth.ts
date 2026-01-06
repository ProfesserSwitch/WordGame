import { useDispatch , useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import type { Role } from "../store/types";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


export const hasRole = (role: Role, allowed: Role[]) =>
  allowed.includes(role);



