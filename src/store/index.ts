import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authentication";
import stageReducer from "./reducers/stage";
import shopReducer from "./reducers/shop";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    stage: stageReducer,
    shop: shopReducer,
  },
});


//types สำหรับใช้กับ useSelector และ useDispatch typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;