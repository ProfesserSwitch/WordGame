import { useAppDispatch,useAppSelector } from "../../../hook/auth";
import { searchShopItems, ClearShopItems } from "../../../store/reducers/shop";
// import { getAllStage } from "../../../store/reducers/stage";
// import { useCallback,useEffect } from "react";
export const useData = () => {
    const dispatch = useAppDispatch();
    
    const stages = useAppSelector((state) => state.stage.stages);
    const shops = useAppSelector((state) => state.shop.allShops);
    const item = useAppSelector((state) => state.shop.item);
    const loading = useAppSelector((state) => state.shop.loading);

    const searchItems = (searchTerm: string) => {
      dispatch(searchShopItems(searchTerm));
    };

    const resetItems = () => {
      dispatch(ClearShopItems());
    };
    

    return {
      stages,
      shops,
      item,
      loading,

      searchItems,
      resetItems,
    }
}