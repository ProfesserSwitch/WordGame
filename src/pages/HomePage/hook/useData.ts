import { useAppDispatch,useAppSelector } from "../../../hook/auth";
// import { getAllStage } from "../../../store/reducers/stage";
// import { useCallback,useEffect } from "react";
export const useData = () => {
    const dispatch = useAppDispatch();
    
    const stages = useAppSelector((state) => state.stage.stages);
    const shops = useAppSelector((state) => state.shop.shops);
    console.log("stages in useStageAdv:", stages);
    console.log("shop",shops)

    return {
      stages,
      shops
    }
}