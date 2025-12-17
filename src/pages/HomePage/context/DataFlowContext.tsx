import React, {
  createContext,
  useContext,
} from "react";
import { useStageAdv } from "../hook/useStageAdv";

/* =====================
   Context type
===================== */
type DataFlowContextType = {
  stages: ReturnType<typeof useStageAdv>["stages"];
};

/* =====================
   createContext
===================== */
const DataFlowContext = createContext<
  DataFlowContextType | undefined
>(undefined);

/* =====================
   Provider props
===================== */
type DataFlowProviderProps = {
  children: React.ReactNode;
};

/* =====================
   Provider
===================== */
export const DataFlowProvider = ({
  children,
}: DataFlowProviderProps) => {
  const { stages } = useStageAdv();

  return (
    <DataFlowContext.Provider value={{ stages }}>
      {children}
    </DataFlowContext.Provider>
  );
};

/* =====================
   custom hook
===================== */
export const useDataFlow = (): DataFlowContextType => {
  const context = useContext(DataFlowContext);

  if (!context) {
    throw new Error(
      "useDataFlow must be used within DataFlowProvider"
    );
  }

  return context;
};
