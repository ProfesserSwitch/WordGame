import { useAppDispatch,useAppSelector } from "../../../hook/auth";
import { getAllStage } from "../../../store/reducers/stage";
import { useCallback,useEffect } from "react";
export const useStageAdv = () => {
    const dispatch = useAppDispatch();
    
    const stages = useAppSelector((state) => state.stage.stages);
    console.log("stages in useStageAdv:", stages);
    const fetchAllStage = useCallback(() => {
        dispatch(getAllStage());
    }, [dispatch]);
    useEffect(() => {
        fetchAllStage();
    }, [fetchAllStage]);
    return {
      stages,
    }
}