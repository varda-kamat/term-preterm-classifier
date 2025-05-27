import { integer, real, pgTable, varchar, timestamp, serial, uuid} from "drizzle-orm/pg-core";

export const PatientData = pgTable('patient_data', {
    patient_id: integer('patient_id'), // Use lowercase
    patient_name: varchar('name'),
    gestation: real('gestation').notNull(),
    age: integer('age').notNull(),
    parity: integer('parity').notNull(),
    abortions: integer('abortions').notNull(),
    weight: real('weight').notNull(),
    hypertension: integer('hypertension').notNull(),
    diabetes: integer('diabetes').notNull(),
    placental_position: integer('placental_position').notNull(),
    bleeding_first_trimester: integer('bleeding_first_trimester').notNull(),
    bleeding_second_trimester: integer('bleeding_second_trimester').notNull(),
    funneling: integer('funneling').notNull(),
    smoker: integer('smoker').notNull(),
    root_mean_square: real('root_mean_square').notNull(),
    median_frequency: real('median_frequency').notNull(),
    peak_frequency: real('peak_frequency').notNull(),
    sample_entropy: real('sample_entropy').notNull(),
});


export const PredictionHistory = pgTable('prediction_history', {
  prediction_id: uuid('prediction_id').primaryKey(), // Unique identifier for the prediction record
  patient_id: integer('patient_id').notNull(), // Foreign key to the patient_data table
  patient_name: varchar('patient_name').notNull(), // Name of the patient
  prediction_result: varchar('prediction_result').notNull(), // Prediction result ("Term" or "Preterm")
  prediction_date: timestamp('prediction_date').defaultNow(), // Date and time of the prediction
});
