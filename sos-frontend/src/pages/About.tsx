import { Box, Card, CardContent, Typography, Grid, Container } from "@mui/material";
import React from "react";
const articles = [
  {
    id: 1,
    title: "Understanding Fire Emergencies",
    description: "Learn how to handle fire emergencies effectively and ensure safety measures.",
  },
  {
    id: 2,
    title: "First Aid Basics for Medical Emergencies",
    description: "Essential first aid techniques to manage medical emergencies before help arrives.",
  },
  {
    id: 3,
    title: "Home Security and Intrusion Prevention",
    description: "Tips on securing your home and preventing unauthorized access.",
  },
  {
    id: 4,
    title: "What to Do in Case of a Flood",
    description: "Flood safety measures and how to protect yourself and your property during a flood.",
  },
  {
    id: 5,
    title: "Dealing with Power Outages",
    description: "Steps to take during power outages and how to prepare for unexpected blackouts.",
  },
  {
    id: 6,
    title: "SOS Signals and Communication",
    description: "How to send SOS signals during an emergency and the meaning of various distress signals.",
  },
  {
    id: 7,
    title: "Earthquake Safety Guidelines",
    description: "Earthquake preparedness, what to do before, during, and after an earthquake.",
  },
  {
    id: 8,
    title: "Mental Health during Emergencies",
    description: "Coping with stress and anxiety during emergencies and the importance of mental health support.",
  },
];

function About() {
  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mt: 6 }}>
        About SOS
      </Typography>
      <Typography variant="body1" paragraph sx={{ textAlign: "center", color: "gray" }}>
        Stay informed with essential articles on safety, security, and emergency response. Learn how to handle various situations
        effectively and ensure your safety and well-being in times of need.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        {articles.map((article) => (
          <Grid item xs={12} sm={6} md={3} key={article.id}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {article.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {article.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default About;
