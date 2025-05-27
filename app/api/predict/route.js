import { NextResponse } from 'next/server';
import { db } from "../../../configs/dbConnect"; // Import database connection
import { PatientData } from "../../../configs/dbSchema"; // Import the patient table schema
import { exec } from "child_process";
import path from "path";

// Function to execute Python script and return a promise
function runPythonScript(inputDataString) {
  return new Promise((resolve, reject) => {
    // Path to the Python script
    const pythonScriptPath = path.resolve("D:/coding/mern/rkproject/my-app/ml_script.py");

    exec(`python ${pythonScriptPath} ${inputDataString}`, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing Python script: ${error}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout.trim()); // Return the output from the Python script
    });
  });
}

// This API endpoint will receive patient data, run the ML code, and return the prediction
export async function POST(request) {
  try {
    // Extract patient data from the request body
    const patientData = await request.json();

    // Extract the input features for the model
    const inputData = [
      patientData.age,
      patientData.parity,
      patientData.abortions,
      patientData.weight,
      patientData.hypertension,
      patientData.diabetes,
      patientData.placental_position,
      patientData.bleeding_first_trimester,
      patientData.bleeding_second_trimester,
      patientData.funneling,
      patientData.smoker,
      patientData.root_mean_square,
      patientData.median_frequency,
      patientData.peak_frequency,
      patientData.sample_entropy
    ];

    // Prepare the input data as a string to pass to the Python script
    const inputDataString = inputData.join(',');

    // Run the Python script and get the prediction
    const prediction = await runPythonScript(inputDataString);

    // Return the prediction as the response
    return NextResponse.json({ prediction });

  } catch (err) {
    console.error("Error in API:", err);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}
