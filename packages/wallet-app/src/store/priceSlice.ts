import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCryptoPrices } from "../utils/fetchCryptoPrices";
import { FETCH_PRICES_INTERVAL } from "../constants/price";

export const fetchPrices = createAsyncThunk(
  "price/fetchPrices",
  async (_, { getState }: any) => {
    const { lastUpdated } = getState().price;
    const currentTime = new Date().getTime();

    if (currentTime - lastUpdated < FETCH_PRICES_INTERVAL) {
      const data = JSON.parse(await AsyncStorage.getItem("prices"));
      return data;
    }

    const data = await fetchCryptoPrices();
    await AsyncStorage.setItem("prices", JSON.stringify(data));
    return data;
  }
);

export interface CryptoPrices {
  ethereum: {
    usd: number;
  };
  solana: {
    usd: number;
  };
}

export interface PriceState {
  data: CryptoPrices;
  lastUpdated: number;
  status: "idle" | "loading" | "rejected";
}

const initialState = {
  data: {
    ethereum: {
      usd: 0,
    },
    solana: {
      usd: 0,
    },
  },
  lastUpdated: 0,
  status: "idle",
};

const priceSlice = createSlice({
  name: "prices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrices.fulfilled, (state, action) => {
        state.data = action.payload;
        state.lastUpdated = new Date().getTime();
        state.status = "fulfilled";
      })
      .addCase(fetchPrices.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPrices.rejected, (state) => {
        state.status = "rejected";
      });
  },
});

export default priceSlice.reducer;
