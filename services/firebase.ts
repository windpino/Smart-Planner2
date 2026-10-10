import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from "firebase/firestore";
import { Order, ProductDefinition, ClientDefinition, FinancialRecord, ScheduleEvent } from "../types";

export const firebaseConfig = {
  apiKey: "AIzaSyA-S6g8ndr6d7ikPwg6VkgatwJs7hGMgPo",
  authDomain: "smart-loading-planner.firebaseapp.com",
  projectId: "smart-loading-planner",
  storageBucket: "smart-loading-planner.firebasestorage.app",
  messagingSenderId: "730266700723",
  appId: "1:730266700723:web:1841c73006b87cbfdad9c6",
  measurementId: "G-4BB4S2VV1F"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface PlannerCloudData {
  orders: Order[];
  products: ProductDefinition[];
  clients: ClientDefinition[];
  financials: FinancialRecord[];
  schedules: ScheduleEvent[];
  updatedAt: string;
}

const PLANNER_DOC_PATH = "planner_data/main";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errString = error instanceof Error ? error.message : String(error);
  console.warn(`Firestore [${operationType}] at ${path}:`, errString);
  return { error: errString, operationType, path };
}

// Save complete planner state to Firestore
export async function savePlannerDataToFirestore(data: {
  orders: Order[];
  products: ProductDefinition[];
  clients: ClientDefinition[];
  financials: FinancialRecord[];
  schedules: ScheduleEvent[];
}): Promise<boolean> {
  try {
    const payload: PlannerCloudData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, "planner_data", "main"), payload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, PLANNER_DOC_PATH);
    return false;
  }
}

// Fetch planner state from Firestore once
export async function fetchPlannerDataFromFirestore(): Promise<PlannerCloudData | null> {
  try {
    const snapshot = await getDoc(doc(db, "planner_data", "main"));
    if (snapshot.exists()) {
      return snapshot.data() as PlannerCloudData;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, PLANNER_DOC_PATH);
    return null;
  }
}

// Subscribe to real-time planner state updates
export function subscribeToPlannerData(
  onData: (data: PlannerCloudData) => void,
  onError?: (err: unknown) => void
) {
  return onSnapshot(
    doc(db, "planner_data", "main"),
    (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data() as PlannerCloudData;
        onData(cloudData);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, PLANNER_DOC_PATH);
      if (onError) onError(error);
    }
  );
}
