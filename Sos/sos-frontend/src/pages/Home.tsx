import React from "react"
import { Typography, Box, Card, CardContent, Grid } from "@mui/material"
import { useThemeContext } from "../contexts/ThemeContext"

const sosAlerts = [
  {
    id: 1,
    title: "Emergency in Area A",
    description: "Fire reported in building 123.",
    status: "Critical",
    time: "10:00 AM",
  },
  {
    id: 2,
    title: "Medical Emergency",
    description: "Heart attack reported in building 456.",
    status: "High",
    time: "10:15 AM",
  },
  {
    id: 3,
    title: "Power Outage",
    description: "Power outage in sector 7.",
    status: "Medium",
    time: "10:30 AM",
  },
]

function Home() {
  const { theme } = useThemeContext() 

  const isDarkMode = theme.palette.mode === "dark"

  return (
    <Box sx={{ padding: 3, backgroundColor: theme.palette.background.default, color: theme.palette.text.primary }}>
      <Typography variant="h4" gutterBottom>
        SOS Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Welcome to the SOS Dashboard. Here you can view all the recent SOS alerts.
      </Typography>
      <Grid container spacing={3}>
        {sosAlerts.map((alert) => (
          <Grid item key={alert.id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: isDarkMode ? "#121212" : (alert.status === "Critical"
                    ? "#ffcccc"
                    : alert.status === "High"
                    ? "#ffe6cc"
                    : "#ffffcc"),
                color: isDarkMode ? "#ffffff" : "inherit", // White text in dark mode
              }}
            >
              <CardContent>
                <Typography variant="h6" component="div">
                  {alert.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {alert.description}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Status: {alert.status}
                </Typography>
                <Typography variant="caption" display="block">
                  Time: {alert.time}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Home
