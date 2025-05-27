import pandas as pd
import numpy as np
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

df = pd.read_csv(r'D:\Downloads\preprocessed_data.csv')
df = df.drop(columns=['Gestation'])

X = df.drop(columns=['term-preterm-status'])
y = df['term-preterm-status']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

smote = SMOTE(random_state=42)
X_train_res, y_train_res = smote.fit_resample(X_train, y_train)

scaler = StandardScaler()
X_train_res = scaler.fit_transform(X_train_res)
X_test = scaler.transform(X_test)

rf_model = RandomForestClassifier(random_state=42)

param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [10, 20, None],
    'min_samples_split': [2, 5, 10]
}

random_search = RandomizedSearchCV(rf_model, param_grid, n_iter=10, cv=5, random_state=42, n_jobs=-1)
random_search.fit(X_train_res, y_train_res)

best_rf_model = random_search.best_estimator_

def classify_term_preterm_rf():
    print("Please enter the following values:")

    age = float(input("Age (years): "))
    parity = int(input("Parity (Number of children): "))
    abortions = int(input("Abortions (Number of abortions): "))
    weight = float(input("Weight (kg): "))
    hypertension = int(input("Hypertension (1 for Yes, 0 for No): "))
    diabetes = int(input("Diabetes (1 for Yes, 0 for No): "))
    placental_position = int(input("Placental Position (1 for Normal, 0 for Abnormal): "))
    bleeding_first_trimester = int(input("Bleeding First Trimester (1 for Yes, 0 for No): "))
    bleeding_second_trimester = int(input("Bleeding Second Trimester (1 for Yes, 0 for No): "))
    funneling = int(input("Funneling (1 for Yes, 0 for No): "))
    smoker = int(input("Smoker (1 for Yes, 0 for No): "))
    rms = float(input("Root Mean Square (RMS): "))
    median_frequency = float(input("Median Frequency: "))
    peak_frequency = float(input("Peak Frequency: "))
    sample_entropy = float(input("Sample Entropy: "))
    
    user_input = np.array([[age, parity, abortions, weight, hypertension, diabetes, placental_position,
                            bleeding_first_trimester, bleeding_second_trimester, funneling, smoker,
                            rms, median_frequency, peak_frequency, sample_entropy]])
    
    user_input_scaled = scaler.transform(user_input)
    
    prediction = best_rf_model.predict(user_input_scaled)
    result = "Term" if prediction[0] == 1 else "Preterm"
    print(f"\nClassified as: {result}")

classify_term_preterm_rf()