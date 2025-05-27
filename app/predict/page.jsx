"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../configs/dbConnect";
import { PatientData, PredictionHistory } from "../../configs/dbSchema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { v4 as uuidv4 } from "uuid";

export default function Predict() {
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [doctorInputs, setDoctorInputs] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [image, setImage] = useState(null);
  const [bgColor, setBgColor] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const patientIdFromParams = searchParams.get("patient_id");
    if (patientIdFromParams) setPatientId(patientIdFromParams);

    fetchRecentPredictions();

    const intervalId = setInterval(() => setBgColor(generateRandomColor()), 5000);
    return () => clearInterval(intervalId);
  }, [searchParams]);

  const generateRandomColor = () => {
    const colors = [
      "bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600",
      "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600",
      "bg-gradient-to-r from-green-400 via-yellow-400 to-amber-500",
      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const fetchRecentPredictions = async () => {
    try {
      const result = await db
        .select()
        .from(PredictionHistory)
        .limit(5);

      setRecentPredictions(result);
    } catch (err) {
      setError("Error fetching recent predictions.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await db
        .select()
        .from(PatientData)
        .where(eq(PatientData.patient_id, Number(patientId)));

      if (result.length > 0) {
        const patient = result[0];
        setPatientData(patient);

        const inputs = { ...patient };
        delete inputs.patient_id;
        delete inputs.patient_name;

        const emptyInputs = Object.keys(inputs).reduce((acc, key) => {
          acc[key] = "";
          return acc;
        }, {});

        setDoctorInputs(emptyInputs);
      } else {
        setError(`No patient found with ID ${patientId}`);
      }
    } catch (err) {
      setError("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setDoctorInputs((prevInputs) => ({ ...prevInputs, [key]: value }));
  };

  const handlePredict = async () => {
    const gestation = parseFloat(doctorInputs.gestation);
    if (isNaN(gestation)) {
      setError("Please enter a valid gestation value.");
      return;
    }

    const prediction = gestation > 37 ? "Term" : "Preterm";
    setPredictionResult(prediction);
    await savePrediction(prediction);
  };

  const savePrediction = async (prediction) => {
    try {
      const predictionId = uuidv4();

      await db.insert(PredictionHistory).values({
        prediction_id: predictionId,
        patient_id: patientData.patient_id,
        patient_name: patientData.patient_name,
        prediction_result: prediction,
        prediction_date: new Date(),
      });

      setRecentPredictions((prevPredictions) => [
        { 
          patient_id: patientData.patient_id, 
          patient_name: patientData.patient_name, 
          prediction_result: prediction, 
          prediction_date: new Date() 
        },
        ...prevPredictions.slice(0, 4),
      ]);
    } catch (err) {
      setError("Error saving prediction.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  return (
    <div className={`min-h-screen ${bgColor} bg-cover bg-fixed`}>
      <Card className="relative z-10 bg-white bg-opacity-90 shadow-xl rounded-lg m-6">
        <CardHeader>
          <CardTitle>Search Patient Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <Input
              name="patient_id"
              placeholder="Enter Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-3"
            />
            <Button type="submit" disabled={loading} className="bg-indigo-600 text-white rounded-lg p-3">
              {loading ? "Processing..." : "Search"}
            </Button>
          </form>

          {error && <p className="text-red-500 mb-6">{error}</p>}

          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-2"
            />
            {image && (
              <img
                src={image}
                alt="Signal"
                className="w-full max-w-3xl mx-auto rounded-lg shadow-lg transition-transform transform hover:scale-105"
              />
            )}
          </div>

          {patientData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-md shadow-md">
                <h2 className="text-3xl font-semibold mb-4">Patient Details</h2>
                <p><strong>Patient ID:</strong> {patientData.patient_id}</p>
                <p><strong>Name:</strong> {patientData.patient_name}</p>
                {Object.keys(doctorInputs).map((key) => (
                  <p key={key} className="text-lg">
                    <strong>{key.replace(/_/g, " ")}:</strong> {patientData[key]}
                  </p>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-md shadow-md">
                <h3 className="text-xl font-semibold mb-4">Doctor's Input</h3>
                <form>
                  {Object.keys(doctorInputs).map((key) => (
                    <div key={key} className="mb-4">
                      <label htmlFor={key} className="block text-sm font-medium">
                        {key.replace(/_/g, " ")}
                      </label>
                      <Input
                        id={key}
                        name={key}
                        value={doctorInputs[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        className="mt-1 border border-gray-300 rounded-lg p-3"
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={handlePredict} className="bg-green-500 text-white rounded-lg p-3">
                    Predict
                  </Button>
                </form>

                {predictionResult && (
                  <div
                    className={`mt-6 p-4 ${
                      predictionResult === "Term" ? "bg-green-100" : "bg-red-100"
                    } rounded-md`}
                  >
                    <h3 className="text-lg font-semibold">Prediction Result</h3>
                    <p>
                      This pregnancy is classified as: <strong>{predictionResult}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Last 5 Predictions</h3>
            {recentPredictions.length > 0 ? (
              <ul className="space-y-4">
                {recentPredictions.map((prediction) => (
                  <li key={prediction.prediction_id} className="bg-gray-50 p-4 rounded-md shadow-md">
                    <p><strong>Patient ID:</strong> {prediction.patient_id}</p>
                    <p><strong>Name:</strong> {prediction.patient_name}</p>
                    <p><strong>Prediction:</strong> {prediction.prediction_result}</p>
                    <p><strong>Date:</strong> {new Date(prediction.prediction_date).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No predictions found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
















/*"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../configs/dbConnect";
import { PatientData, PredictionHistory } from "../../configs/dbSchema";
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { v4 as uuidv4 } from "uuid";

export default function Predict() {
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [doctorInputs, setDoctorInputs] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]); // Store the last 5 predictions
  const [image, setImage] = useState(null); // State for the uploaded image
  const [bgColor, setBgColor] = useState(""); // State for dynamic background color

  const searchParams = useSearchParams();

  useEffect(() => {
    const patientIdFromParams = searchParams.get("patient_id");
    if (patientIdFromParams) {
      setPatientId(patientIdFromParams);
    }

    // Fetch the last 5 predictions on initial load
    fetchRecentPredictions();

    // Set dynamic background color every 5 seconds
    const intervalId = setInterval(() => {
      setBgColor(generateRandomColor());
    }, 5000); // Change color every 5 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [searchParams]);

  const generateRandomColor = () => {
    const colors = [
      "bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600",
      "bg-gradient-to-r from-orange-500 via-red-500 to-pink-600",
      "bg-gradient-to-r from-green-400 via-yellow-400 to-amber-500",
      "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const fetchRecentPredictions = async () => {
    try {
      const result = await db
        .select()
        .from(PredictionHistory)
        .orderBy("prediction_date", "desc") // Order by prediction date descending
        .limit(5); // Limit to the last 5 predictions

      setRecentPredictions(result); // Update state with recent predictions
    } catch (err) {
      setError("Error fetching recent predictions.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await db
        .select()
        .from(PatientData)
        .where(eq(PatientData.patient_id, Number(patientId)));

      if (result.length > 0) {
        const patient = result[0];
        setPatientData(patient);

        const inputs = { ...patient };
        delete inputs.patient_id;
        delete inputs.patient_name;

        const emptyInputs = Object.keys(inputs).reduce((acc, key) => {
          acc[key] = "";
          return acc;
        }, {});

        setDoctorInputs(emptyInputs);
      } else {
        setError(`No patient found with ID ${patientId}`);
      }
    } catch (err) {
      setError("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setDoctorInputs((prevInputs) => ({ ...prevInputs, [key]: value }));
  };

  const handlePredict = async () => {
    const gestation = parseFloat(doctorInputs.gestation);
    if (isNaN(gestation)) {
      setError("Please enter a valid gestation value.");
      return;
    }
    const prediction = gestation > 37 ? "Term" : "Preterm";
    setPredictionResult(prediction);

    // Save the prediction to the database
    await savePrediction(prediction);
  };

  const savePrediction = async (prediction) => {
    try {
      const predictionId = uuidv4(); // Generate UUID

      // Insert new prediction into PredictionHistory table
      await db.insert(PredictionHistory).values({
        prediction_id: predictionId, // Insert manually generated UUID
        patient_id: patientData.patient_id, // Fetch from patientData
        patient_name: patientData.patient_name, // Fetch from patientData
        prediction_result: prediction, // Result of prediction ("Term" or "Preterm")
        prediction_date: new Date(), // Using current date and time
      });

      console.log("Prediction saved successfully");

      // Fetch the updated list of recent predictions
      fetchRecentPredictions(); // Immediately fetch updated predictions
    } catch (err) {
      console.error("Error saving prediction:", err);
      setError("Error saving prediction.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Display the image
    }
  };

  return (
    <div className={`min-h-screen ${bgColor} bg-cover bg-fixed`}>
      <Card className="relative z-10 bg-white bg-opacity-90 shadow-xl rounded-lg m-6">
        <CardHeader>
          <CardTitle>Search Patient Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4 mb-6 animate__animated animate__fadeIn">
            <Input
              name="patient_id"
              placeholder="Enter Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg p-3"
            />
            <Button type="submit" disabled={loading} className="bg-indigo-600 text-white rounded-lg p-3">
              {loading ? "Processing..." : "Search"}
            </Button>
          </form>

          {error && <p className="text-red-500 mb-6">{error}</p>}

          {/* Image Upload Section }
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-4 border-2 border-dashed border-gray-300 rounded-lg p-2"
            />
            {image && (
              <img
                src={image}
                alt="Signal"
                className="w-full max-w-3xl mx-auto rounded-lg shadow-lg transition-transform transform hover:scale-105"
              />
            )}
          </div>

          {patientData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Column: Patient Details }
              <div className="bg-gray-50 p-6 rounded-md shadow-md animate__animated animate__fadeIn">
                <h2 className="text-3xl font-semibold mb-4">Patient Details</h2>
                <p><strong>Patient ID:</strong> {patientData.patient_id}</p>
                <p><strong>Name:</strong> {patientData.patient_name}</p>
                {Object.keys(doctorInputs).map((key) => (
                  <p key={key} className="text-lg">
                    <strong>{key.replace(/_/g, " ")}:</strong> {patientData[key]}
                  </p>
                ))}
              </div>

              {/* Second Column: Doctor's Input Form }
              <div className="bg-gray-50 p-6 rounded-md shadow-md animate__animated animate__fadeIn">
                <h3 className="text-xl font-semibold mb-4">Doctor's Input</h3>
                <form>
                  {Object.keys(doctorInputs).map((key) => (
                    <div key={key} className="mb-4">
                      <label htmlFor={key} className="block text-sm font-medium">
                        {key.replace(/_/g, " ")}
                      </label>
                      <Input
                        id={key}
                        name={key}
                        value={doctorInputs[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        className="mt-1 border border-gray-300 rounded-lg p-3"
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={handlePredict} className="bg-green-500 text-white rounded-lg p-3">
                    Predict
                  </Button>
                </form>

                {predictionResult && (
                  <div
                    className={`mt-6 p-4 ${
                      predictionResult === "Term" ? "bg-green-100" : "bg-red-100"
                    } rounded-md`}
                  >
                    <h3 className="text-lg font-semibold">Prediction Result</h3>
                    <p>
                      This pregnancy is classified as: <strong>{predictionResult}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Display Last 5 Predictions }
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Last 5 Predictions</h3>
            {recentPredictions.length > 0 ? (
              <ul className="space-y-4">
                {recentPredictions.map((prediction) => (
                  <li key={prediction.prediction_id} className="bg-gray-50 p-4 rounded-md shadow-md">
                    <p><strong>Patient ID:</strong> {prediction.patient_id}</p>
                    <p><strong>Name:</strong> {prediction.patient_name}</p>
                    <p><strong>Prediction:</strong> {prediction.prediction_result}</p>
                    <p><strong>Date:</strong> {new Date(prediction.prediction_date).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No predictions found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
*/






/*

"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "../../configs/dbConnect";
import { PatientData, PredictionHistory } from "../../configs/dbSchema"; // Assuming you have a PredictionHistory schema for storing results
import { eq } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { v4 as uuidv4 } from 'uuid';
export default function Predict() {
  const [patientId, setPatientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [doctorInputs, setDoctorInputs] = useState({});
  const [predictionResult, setPredictionResult] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]); // Store the last 5 predictions

  const searchParams = useSearchParams();

  useEffect(() => {
    const patientIdFromParams = searchParams.get("patient_id");
    if (patientIdFromParams) {
      setPatientId(patientIdFromParams);
    }

    // Fetch the last 5 prediction results
    fetchRecentPredictions();
  }, [searchParams]);

  const fetchRecentPredictions = async () => {
    try {
      const result = await db
        .select()
        .from(PredictionHistory)
        .limit(5) // Limit to the last 5 predictions
        .orderBy("created_at", "desc"); // Assuming you have a timestamp field 'created_at' for ordering

      setRecentPredictions(result);
    } catch (err) {
      setError("Error fetching recent predictions.");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await db
        .select()
        .from(PatientData)
        .where(eq(PatientData.patient_id, Number(patientId)));

      if (result.length > 0) {
        const patient = result[0];
        setPatientData(patient);

        const inputs = { ...patient };
        delete inputs.patient_id;
        delete inputs.patient_name;

        const emptyInputs = Object.keys(inputs).reduce((acc, key) => {
          acc[key] = "";
          return acc;
        }, {});

        setDoctorInputs(emptyInputs);
      } else {
        setError(`No patient found with ID ${patientId}`);
      }
    } catch (err) {
      setError("Error fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setDoctorInputs((prevInputs) => ({ ...prevInputs, [key]: value }));
  };

  const handlePredict = async () => {
    const gestation = parseFloat(doctorInputs.gestation);
    if (isNaN(gestation)) {
      setError("Please enter a valid gestation value.");
      return;
    }
    const prediction = gestation > 37 ? "Term" : "Preterm";
    setPredictionResult(prediction);

    // Save the prediction to the database
    await savePrediction(prediction);
  };
  const savePrediction = async (prediction) => {
    try {
      // Generate UUID manually (optional, if you want to handle it in the app)
      const predictionId = uuidv4(); // Generate UUID
      
      // Insert the prediction record, with UUID for 'prediction_id'
      const result = await db.insert(PredictionHistory).values({
        prediction_id: predictionId, // Insert manually generated UUID
        patient_id: patientData.patient_id, // Fetch from patientData
        patient_name: patientData.patient_name, // Fetch from patientData
        prediction_result: prediction, // Result of prediction ("Term" or "Preterm")
        prediction_date: new Date(), // Using current date and time
      });
  
      console.log("Prediction saved successfully", result); // Log to confirm save
      fetchRecentPredictions(); // Fetch the updated list of recent predictions
    } catch (err) {
      console.error("Error saving prediction:", err); // Log error for debugging
      setError("Error saving prediction.");
    }
  };
  

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Search Patient Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <Input
              name="patient_id"
              placeholder="Enter Patient ID"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Search"}
            </Button>
          </form>

          {error && <p className="text-red-500 mb-6">{error}</p>}

          {patientData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Column: Patient Details }
              <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                <h2 className="text-4xl font-semibold mb-4">Patient Details</h2>
                <p><strong>Patient ID:</strong> {patientData.patient_id}</p>
                <p><strong>Name:</strong> {patientData.patient_name}</p>
                {Object.keys(doctorInputs).map((key) => (
                  <p key={key} className="text-lg">
                    <strong>{key.replace(/_/g, " ")}:</strong> {patientData[key]}
                  </p>
                ))}
              </div>

              {//Second Column: Doctor's Input Form }
              <div className="bg-gray-50 p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Doctor's Input</h3>
                <form>
                  {Object.keys(doctorInputs).map((key) => (
                    <div key={key} className="mb-4">
                      <label htmlFor={key} className="block text-sm font-medium">
                        {key.replace(/_/g, " ")}
                      </label>
                      <Input
                        id={key}
                        name={key}
                        value={doctorInputs[key]}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        className="mt-1"
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={handlePredict}>
                    Predict
                  </Button>
                </form>

                {predictionResult && (
                  <div
                    className={`mt-6 p-4 ${
                      predictionResult === "Term" ? "bg-green-100" : "bg-red-100"
                    } rounded-md`}
                  >
                    <h3 className="text-lg font-semibold">Prediction Result</h3>
                    <p>
                      This pregnancy is classified as: <strong>{predictionResult}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
)}

          {/* Display Last 5 Predictions }
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Last 5 Predictions</h3>
            {recentPredictions.length > 0 ? (
              <ul className="space-y-4">
                {recentPredictions.map((prediction) => (
                  <li key={prediction.patient_id} className="bg-gray-50 p-4 rounded-md shadow-sm">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
*/