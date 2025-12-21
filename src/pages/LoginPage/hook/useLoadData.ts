import { useAppDispatch, useAppSelector } from "../../../hook/auth";
import { getAllStage } from "../../../store/reducers/stage";
import { getShop } from "../../../store/reducers/shop";
import { useCallback, useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const fetchAllStage = useCallback(() => {
    return dispatch(getAllStage()).unwrap();
  }, [dispatch]);

  const fetchAllShop = useCallback(() => {
    return dispatch(getShop()).unwrap();
  }, [dispatch]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAllStage(), fetchAllShop()]);
    } catch (error) {
      console.error("fetchAllData error:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchAllStage, fetchAllShop]);

  return {
    fetchAllStage,
    fetchAllShop,

    fetchAllData,
    loading,
  };
};
