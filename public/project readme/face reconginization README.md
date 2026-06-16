# Face Attendance System

A Python-based face recognition attendance system that uses computer vision to detect and recognize faces, marking attendance only when a blink is detected to ensure liveliness.

## Features

- Face detection and recognition using dlib
- Blink detection for liveliness check
- Registration of new faces with multiple expressions
- Deletion of registered faces
- Attendance logging to JSON
- Real-time video processing

## Requirements

- Python 3.x
- OpenCV (cv2)
- dlib
- numpy
- scipy
- datetime, json, os, time (standard library)

### Model Files

Download the following dlib model files and place them in the project directory:

- `shape_predictor_68_face_landmarks.dat` (from dlib's face landmarks model)
- `dlib_face_recognition_resnet_model_v1.dat` (from dlib's face recognition model)

These can be downloaded from dlib's model repository or official sources.

## Installation

1. Install required Python packages:
   ```
   pip install opencv-python dlib numpy scipy
   ```

2. Ensure model files are in the project directory.

## Usage

Run the script:

```
python faceLoginSystem.py
```

### Controls

- Press 'r' to register a new face (enter name, follow prompts for expressions)
- Press 'd' to delete a registered face (enter name)
- Press 'q' to quit and save attendance

The system will display the video feed with detected faces labeled. Attendance is marked only if a recent blink is detected.

## How It Works

1. **Face Detection**: Uses dlib's frontal face detector to find faces in the video frame.
2. **Feature Extraction**: Computes 128D face descriptors using ResNet model.
3. **Recognition**: Compares descriptors to known faces using Euclidean distance (threshold 0.5).
4. **Blink Detection**: Calculates Eye Aspect Ratio (EAR) to detect blinks, requiring consecutive low EAR frames.
5. **Attendance**: Marks attendance only when a recognized face has a recent blink within 5 seconds.

## Detailed Code Explanation

This Python script implements a face attendance system using computer vision libraries. It detects faces in real-time video, recognizes registered individuals, and marks attendance only if a blink (liveliness check) is detected recently. Below is a detailed breakdown of the code structure, classes, methods, and logic.

### Imports
- `cv2`: OpenCV for video capture, image processing, and display.
- `dlib`: For face detection, landmark prediction, and face recognition.
- `numpy as np`: For numerical arrays and computations.
- `datetime`: For timestamping attendance.
- `json`: For saving/loading face data and attendance logs.
- `os`: For file existence checks.
- `time`: For timing blink validity.
- `scipy.spatial.distance`: For Euclidean distance in EAR calculation.

### BlinkDetector Class
This class handles blink detection using the Eye Aspect Ratio (EAR) method to prevent spoofing.

- **Constants**:
  - `EAR_THRESHOLD = 0.25`: Minimum EAR value to consider eyes closed.
  - `CONSEC_FRAMES = 3`: Number of consecutive frames with low EAR to confirm blink.
  - `TIME_WINDOW = 5`: Seconds a blink remains valid for attendance.

- **`__init__`**: Initializes dictionaries to track blink counters and timestamps per face ID.

- **`eye_aspect_ratio(eye)` (static method)**: Computes EAR for one eye.
  - Eye is a numpy array of 6 landmark points (corners and centers).
  - Formula: (vertical distances A+B) / (2 * horizontal distance C).
  - Lower EAR indicates closed eye.

- **`update(face_id, left_eye, right_eye)`**: Updates blink state for a face.
  - Calculates average EAR for both eyes.
  - Increments counter if EAR < threshold.
  - Resets counter and records blink time if consecutive frames met.
  - Ensures blink is only counted once per event.

- **`is_blink_recent(face_id)`**: Checks if a blink occurred within the time window for the given face ID.

### FaceAttendanceSystem Class
Main class managing face detection, recognition, registration, and attendance.

- **`__init__`**: Sets up:
  - Face detector (dlib's frontal face detector).
  - Shape predictor (68-point facial landmarks model).
  - Face recognition model (ResNet-based 128D descriptor).
  - Loads known faces from `known_faces.json`.
  - Initializes attendance dict and BlinkDetector instance.

- **`load_known_faces`**: Loads face features from JSON, converting lists to numpy arrays.

- **`save_known_faces`**: Saves features to JSON, converting arrays to lists for serialization.

- **`extract_features(frame, face_rect)`**: Extracts 128D face descriptor from a detected face rectangle.

- **`capture_samples(cap, name, sample_count=4)`**: Captures multiple face samples during registration.
  - Prompts user for 4 expressions: neutral, smile, right turn, left turn.
  - Shows countdown and prompts on video window.
  - Detects face, extracts features, stores samples.
  - Handles errors like no face or camera failure.

- **`register_face(frame, face_rect, cap)`**: Registers a new face.
  - Prompts for name.
  - Calls `capture_samples`.
  - Averages features across samples for robustness.
  - Saves to known faces.

- **`delete_face`**: Deletes a registered face by name (case-insensitive match).

- **`recognize_face(features)`**: Matches input features to known faces.
  - Computes Euclidean distance to all known features.
  - Returns name if minimum distance < 0.5 (tuned threshold).
  - Returns "Unknown" otherwise.

- **`mark_attendance(name)`**: Records timestamp for recognized name if not already marked in session.

- **`save_attendance`**: Appends session attendance to `attendance_log.json`, prints full log.

- **`get_eye_landmarks(landmarks)`**: Extracts left and right eye points from 68 facial landmarks (indices 36-41 for left, 42-47 for right).

- **`run`**: Main loop.
  - Opens camera (index 0).
  - In loop: reads frame, detects faces, handles keys ('r' register, 'd' delete, 'q' quit).
  - For each face: predicts landmarks, updates blink detector, extracts features, recognizes, marks attendance only if blink recent, draws bounding box and label.
  - Displays frame.
  - On quit: releases camera, saves attendance.

### Main Execution
- Instantiates `FaceAttendanceSystem` and calls `run()` if script is executed directly.

### Key Logic and Flow
1. **Initialization**: Loads models and known faces.
2. **Registration**: Captures varied samples to handle different poses/expressions.
3. **Recognition**: Real-time matching with distance threshold.
4. **Liveliness**: Blink required to mark attendance, preventing photo/video spoofing.
5. **Persistence**: JSON files for data storage.
6. **UI**: OpenCV windows for video and registration prompts.

### Potential Improvements
- Add multi-threading for better performance.
- Implement database instead of JSON.
- Tune thresholds for environment.
- Add logging for errors.

This system combines face recognition with anti-spoofing via blink detection for secure attendance marking.

## Files

- `faceLoginSystem.py`: Main script
- `known_faces.json`: Stores registered face features
- `attendance_log.json`: Logs attendance timestamps

## Troubleshooting

- **No face detected**: Ensure good lighting and face is clearly visible.
- **Recognition fails**: Register with multiple expressions, check threshold.
- **Model files missing**: Download and place in directory.
- **Camera issues**: Check camera permissions and index (default 0).

## License

[Add license if applicable]