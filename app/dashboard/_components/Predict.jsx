"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "../../../configs/dbConnect";
import { PredictionHistory } from "../../../configs/dbSchema";
import { useClerk } from "@clerk/clerk-react"; // Import useClerk for authentication management

const Predict = () => {
  const { signOut } = useClerk(); // Clerk's signOut function
  const [error, setError] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]); // Store the last 5 predictions

  useEffect(() => {
    // Fetch the last 5 predictions on component mount
    fetchRecentPredictions();
  }, []);

  const fetchRecentPredictions = async () => {
    try {
      const result = await db
        .select()
        .from(PredictionHistory)
        .limit(5) // Limit to the last 5 predictions
        .orderBy("prediction_date", "desc"); // Assuming you have a timestamp field 'prediction_date' for ordering

      setRecentPredictions(result);
    } catch (err) {
      setError("Error fetching recent predictions.");
    }
  };

  const handleLogout = async () => {
    await signOut(); // Sign out the user
    window.location.href = "/"; // Redirect to the dashboard page
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-3xl">Last 5 Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-6">{error}</p>}

          {recentPredictions.length > 0 ? (
            <ul className="space-y-4">
              {recentPredictions.map((prediction) => (
                <li
                  key={prediction.prediction_id}
                  className="bg-gray-50 p-4 rounded-md shadow-sm"
                >
                  <p>
                    <strong>Patient ID:</strong> {prediction.patient_id}
                  </p>
                  <p>
                    <strong>Name:</strong> {prediction.patient_name}
                  </p>
                  <p>
                    <strong>Prediction:</strong> {prediction.prediction_result}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No predictions found.</p>
          )}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <div className="flex justify-between items-center mt-8">
        <Link href="/predict">
          <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-6 rounded-full shadow-lg hover:shadow-xl transition duration-300 hover:scale-105">
            Make Predictions
          </Button>
        </Link>
        <Button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-3 rounded-md shadow-lg hover:shadow-xl transition duration-300 hover:scale-105"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Predict;
