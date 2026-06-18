# Personality-Prediction-Model

Predicting if a person is introvert or an extrovert

# 🧠 Personality Prediction App Using Machine Learning (OOP-Based)

This project is a machine learning-powered console application that predicts a user's personality (Introvert or Extrovert) based on their social behavior, using a Support Vector Machine (SVM) classifier.

---

## 📌 Features

- Predicts personality as **Introvert** or **Extrovert**
- Data visualization possible via Matplotlib/Seaborn (optional)
- Built using **OOP principles** for maintainability and scalability
- Uses **SVM (Support Vector Machine)** for classification
- Saves trained model for reuse (`Personality.pkl`)
- Console-based input for real-time prediction

---

## 📁 Dataset Used

The dataset is named `personality_dataset.csv` and contains social behavior metrics like:

- Time spent alone
- Stage fear (Yes/No)
- Social event attendance
- Enjoyment of going outside
- Drained after socializing (Yes/No)
- Friend circle size
- Social media post frequency
- Personality (Label)

---

## ⚙️ Technologies Used

| Category            | Tools/Technologies                                  |
| ------------------- | --------------------------------------------------- |
| 🧠 Machine Learning | `scikit-learn`, `SVM`, `StandardScaler`, `Pipeline` |
| 🐍 Programming      | Python                                              |
| 📊 Data Analysis    | `pandas`, `numpy`, `seaborn`, `matplotlib`          |
| 💾 Serialization    | `pickle`                                            |
| 🏗️ OOP Design       | Python classes for modular design                   |

---

## 📄 `app.py` — Main Entry Point

### Purpose

Runs the console app, asks user input, and predicts personality.

### Key Steps

- Initializes `Personality` class
- Collects user input from the terminal
- Predicts result using trained model
- Prints result: Extrovert or Introvert

---

## 📄 `core/personality.py`

### Class: `Personality`

Main class that handles:

- Loads `Personality.pkl`
- Provides a `predict()` function for input dictionaries

---

## 📄 `models/train_model.py`

### Function: `train_load_and_save_model`

- Loads the processed dataset
- Uses SVM model to train `Personality.pkl`
- Performs 80/20 train-test split
- Saves trained model in a pickle file

---

## 📄 `utils/data_utils.py`

### Function: `data_loading()`

- Loads dataset with `pandas`
- Renames columns into consistent format
- Drops missing values

---

## 📄 `data/personality_dataset.csv`

- Original personality dataset.
- Contains Personality features and target `Personality` column.
- Preprocessed in `train_model.py`.

---

## ▶️ How to Run the App (Console Version)

1. Run setup script (creates venv, installs dependencies):
   ```bash
   ./setup.sh
   ```
