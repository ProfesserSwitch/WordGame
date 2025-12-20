import { useAppDispatch, useAppSelector } from "../../../hook/auth";
import { getAllStage } from "../../../store/reducers/stage";
import { getShop } from "../../../store/reducers/shop";
import { useCallback } from "react";
// export const useStageAdv = () => {
//     const dispatch = useAppDispatch();

//     const stages = useAppSelector((state) => state.stage.stages);
//     console.log("stages in useStageAdv:", stages);
//     const fetchAllStage = useCallback(() => {
//         dispatch(getAllStage());
//     }, [dispatch]);
//     useEffect(() => {
//         fetchAllStage();
//     }, [fetchAllStage]);
//     return {
//       stages,
//     }
// }

export const useLoadData = () => {
  const dispatch = useAppDispatch();

  const fetchAllStage = useCallback(() => {
    return dispatch(getAllStage()).unwrap();
  }, [dispatch]);

  const fetchAllShop = useCallback(()=>{
    return dispatch(getShop()).unwrap();
  },[dispatch])

  return {
    fetchAllStage,
    fetchAllShop,
  };
};
