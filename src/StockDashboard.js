import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockDashboard = () => {
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockData, setStockData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Stock Price",
        data: [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  });
  const [intervalId, setIntervalId] = useState(null);
  const [isPaused, setIsPaused] = useState(true);

  const API_KEY = "";
  //replace with your api key

  const fetchStockData = async () => {
    if (stockSymbol) {
      setIsFetching(true);
      setError(null);
      try {
        const response = await axios.get("https://finnhub.io/api/v1/quote", {
          params: {
            symbol: stockSymbol,
            token: API_KEY,
          },
        });

        const data = response.data;

        if (data && data.c) {
          setStockData({
            symbol: stockSymbol,
            price: data.c,
            change: data.d,
            percentChange: data.dp,
            high: data.h,
            low: data.l,
            open: data.o,
            volume: data.v,
          });

          setChartData((prevData) => {
            const newLabels = [...prevData.labels, new Date().toLocaleTimeString()];
            const newData = [...prevData.datasets[0].data, data.c];

            if (newLabels.length > 10) {
              newLabels.shift();
              newData.shift();
            }

            return {
              labels: newLabels,
              datasets: [
                {
                  ...prevData.datasets[0],
                  data: newData,
                },
              ],
            };
          });
        } else {
          setError("Invalid stock symbol or API issue");
        }
      } catch (error) {
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setIsFetching(false);
      }
    }
  };

  const handleStartPause = () => {
    if (isPaused) {
      const id = setInterval(() => {
        fetchStockData();
      }, 5000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
    }
    setIsPaused(!isPaused);
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalId);
    };
  }, [intervalId]);

  return (
    <Container
      maxWidth="lg"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        padding: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Real-Time Stock Tracker
      </Typography>
      <TextField
        label="Stock Symbol (e.g., AAPL)"
        variant="outlined"
        value={stockSymbol}
        onChange={(e) => setStockSymbol(e.target.value)}
        fullWidth
        sx={{ maxWidth: 400, marginBottom: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleStartPause}
        sx={{
          backgroundColor: isPaused ? "#1976d2" : "#d32f2f",
          "&:hover": { backgroundColor: isPaused ? "#1565c0" : "#b71c1c" },
          marginBottom: 2,
        }}
      >
        {isPaused ? "Start" : "Pause"}
      </Button>
      {isFetching && <CircularProgress sx={{ color: "gray" }} />}
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          gap: 2,
        }}
      >
        {stockData && (
          <Paper
            elevation={3}
            sx={{
              padding: 2,
              width: "48%",
              height: 300,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Stock Data
            </Typography>
            <Typography>Symbol: {stockData.symbol}</Typography>
            <Typography>Price: ${stockData.price?.toFixed(2)}</Typography>
            <Typography>Change: {stockData.change?.toFixed(2)}</Typography>
            <Typography>High: {stockData.high?.toFixed(2)}</Typography>
            <Typography>Low: {stockData.low?.toFixed(2)}</Typography>
            <Typography>Open: {stockData.open?.toFixed(2)}</Typography>
            <Typography>Volume: {stockData.volume ? stockData.volume : "N/A"}</Typography>

          </Paper>
        )}

        <Paper
          elevation={3}
          sx={{
            width: "48%",
            height: 300,
            padding: 2,
          }}
        >
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default StockDashboard;
