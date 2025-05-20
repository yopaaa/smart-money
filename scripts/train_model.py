import pandas as pd
from sklearn.preprocessing import LabelEncoder
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, GlobalAveragePooling1D, Dense
import tensorflowjs as tfjs
import json
import os
import tensorflow as tf

# === PARAMETER ===
MAX_WORDS = 1000
MAX_LEN = 10
EPOCHS = 20

# === LOAD DATASET ===
df = pd.read_csv("/home/yopa/Desktop/CODING/smart-money/scripts/data.csv")
texts = df['text'].astype(str).values
labels = df['kategori'].values

# === ENCODE LABEL ===
label_encoder = LabelEncoder()
encoded_labels = label_encoder.fit_transform(labels)

with open("label_map.json", "w") as f:
    json.dump({i: label for i, label in enumerate(label_encoder.classes_)}, f)

# === TOKENIZER ===
tokenizer = Tokenizer(num_words=MAX_WORDS, oov_token="<OOV>")
tokenizer.fit_on_texts(texts)
sequences = tokenizer.texts_to_sequences(texts)
padded = pad_sequences(sequences, padding='post', maxlen=MAX_LEN)

with open("tokenizer.json", "w") as f:
    f.write(tokenizer.to_json())

# === BUILD MODEL ===
model = Sequential([
    Embedding(input_dim=MAX_WORDS, output_dim=16, input_length=MAX_LEN),
    GlobalAveragePooling1D(),
    Dense(16, activation='relu'),
    Dense(len(set(encoded_labels)), activation='softmax')
])

model.compile(loss='sparse_categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

# === TRAIN MODEL ===
model.fit(padded, encoded_labels, epochs=EPOCHS, verbose=1)

# === SAVE & CONVERT TO TFJS ===
# Simpan model ke format SavedModel
saved_model_path = "model"  # Tanpa ekstensi .keras

# model.save(saved_model_path)
model.export(saved_model_path)  # Tidak perlu save_format, otomatis ke SavedModel

# tf.saved_model.save(model, saved_model_path)

# Konversi ke TensorFlow.js
tfjs_target_dir = "model-tfjs"
if os.path.exists(tfjs_target_dir):
    import shutil
    shutil.rmtree(tfjs_target_dir)

try:
    tfjs.converters.convert_tf_saved_model(saved_model_path, tfjs_target_dir)
    print("✅ Model berhasil dikonversi ke TensorFlow.js")
except Exception as e:
    print("❌ Gagal mengonversi model:", e)
