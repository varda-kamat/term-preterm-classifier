import fs from 'fs';
import csv from 'csv-parser';
import { db } from "./dbConnect.js"; // Import your Drizzle ORM database instance
import { PatientData } from './dbSchema.js'; // Import your Users table schema

// Function to insert data into the users table
async function insertDataIntoPatientDataTable(data) {
  try {
    await db.insert(PatientData).values(data);
    console.log('Data inserted successfully');
  } catch (error) {
    console.error('Error inserting data:', error);
  }
}

// Function to read CSV and process data
function readCSVAndInsertData(filePath) {
  const results = [];

  if (!fs.existsSync(filePath)) {
    console.error('CSV file not found:', filePath);
    return;
  }
  

  // Reading the CSV file
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      const patient = {
        patient_id: parseInt(data.Patient_ID, 10),
        patient_name: data.Name || "Unknown",
        gestation: parseFloat(data['Gestation']),
        age: parseInt(data.Age, 10),
        parity: data.Parity ? parseInt(data.Parity, 10) : 0, // Default to 0 if empty or null
        abortions: data.Abortions ? parseInt(data.Abortions, 10) : 0,
        weight: data.Weight ? parseFloat(data.Weight) : 0,
        hypertension: data.Hypertension ? parseInt(data.Hypertension, 10) : 0,
        diabetes: data.Diabetes ? parseInt(data.Diabetes, 10) : 0,
        placental_position: data.Placental_position ? parseInt(data.Placental_position, 10) : 0,
        bleeding_first_trimester: data.Bleeding_first_trimester ? parseInt(data.Bleeding_first_trimester, 10) : 0,
        bleeding_second_trimester: data.Bleeding_second_trimester ? parseInt(data.Bleeding_second_trimester, 10) : 0,
        funneling: data.Funneling ? parseInt(data.Funneling, 10) : 0,
        smoker: data.Smoker ? parseInt(data.Smoker, 10) : 0,
        root_mean_square: parseFloat(data['Root Mean Square']),
        median_frequency: parseFloat(data['Median Frequency']),
        peak_frequency: parseFloat(data['Peak Frequency']),
        sample_entropy: parseFloat(data['Sample Entropy']),
        
    };
    
    
      console.log('Mapped patient data:', patient); // Debug to verify the mapping
      results.push(patient);
    })        
    .on('end', async () => {
      // After reading the file, bulk insert the data
      await insertDataIntoPatientDataTable(results);
    });
}

// Call the function to read the CSV file and insert data
readCSVAndInsertData("C:/Users/Lenovo/ML project gynaecology/preprocessed_data.csv");
