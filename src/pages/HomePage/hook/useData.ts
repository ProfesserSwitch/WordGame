import { useAppDispatch, useAppSelector } from "../../../hook/auth";
import { searchShopItems, ClearShopItems } from "../../../store/reducers/shop";
import {
  clearDictionary,
  fetchDictionary,
} from "../../../store/reducers/dictionary";
// import { getAllStage } from "../../../store/reducers/stage";
import { useCallback, useEffect } from "react";
export const useData = () => {
  const dispatch = useAppDispatch();

  const stages = useAppSelector((state) => state.stage.stages);
  const shops = useAppSelector((state) => state.shop.allShops);
  const item = useAppSelector((state) => state.shop.item);

  //loading
  const loading = useAppSelector((state) => state.shop.loading);

  //stage
  const loadingStage = useAppSelector((state) => state.stage.loading);

  // const loadin

  //shop features
  const searchItems = (searchTerm: string) => {
    dispatch(searchShopItems(searchTerm));
  };

  const resetItems = () => {
    dispatch(ClearShopItems());
  };

  // dictionary features
  const dictionary = useAppSelector((state) => state.dictionary.words);
  const DictionaryState = useAppSelector((state) => state.dictionary.loading);
  const hasNext = useAppSelector((state) => state.dictionary.hasNext);
  const lastWord = useAppSelector((state) => state.dictionary.lastWord)
  const fetchDictionarys = useCallback(
    (letter: string, limit: number) => {
      dispatch(fetchDictionary({ startsWith: letter, limit: limit }));
    },
    [dispatch]
  );

  // const loginPlayer = useCallback(
  //     (username: string, password: string) => {
  //       return dispatch(loginUser({ username, password })).unwrap();
  //     },
  //     [dispatch]
  //   );
  return {
    //shop
    shops,
    item,
    loading,
    searchItems,
    resetItems,

    //stages
    stages,
    loadingStage,
   
    //dictionary
    dictionary,
    DictionaryState,
    hasNext,
    lastWord
  };
};
