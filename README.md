# Customer Churn Analysis Dashboard

An interactive, modern customer churn analysis web application built with **Python**, **Streamlit**, **Pandas**, and **Plotly**.

## 📊 Features
- **CSV Data Ingestion & Cleaning**: Upload any churn dataset. The app automatically cleans missing values in charges and standardizes labels.
- **KPI Metrics**: Dynamically display Total Customers, Churned count, Active count, and Churn Rate % for the filtered cohort.
- **Seven Interactive Charts**:
  - Demographic: Churn by Gender, Churn by Contract, Churn by Internet Service.
  - Payment Channels: Grouped horizontal chart of Churn by Payment Method.
  - Distribution Density: Histograms with box margins of Monthly Charges (INR) and Tenure (months).
  - Lifespan Scatter: Tenure vs Monthly Charges colored and sized by churn metrics.
- **Top Attrition Risk Profiles**: Automatically scans data groupings to report the top three critical customer risk profiles.
- **Business Intelligence & Recommendations**: Displays automated statistical observations and matches them with marketing recommendations.
- **Exports**: Download filtered segment datasets as CSV or download plain text summaries of insights and recommendations.

---

## 🚀 Running Locally

### 1. Initialize Virtual Environment & Install Dependencies
```bash
# Create a virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### 2. Launch Streamlit app
```bash
streamlit run app.py
```
Open [http://localhost:8501](http://localhost:8501) in your browser.

---

## 🌐 How to Deploy to GitHub & Streamlit Community Cloud

### Step 1: Initialize Git and Commit Code (Local)
If you haven't already committed the files, run:
```bash
git init
git add app.py requirements.txt .gitignore README.md
git commit -m "Initialize Customer Churn Analysis Dashboard"
```

### Step 2: Push to GitHub
1. Create a new, blank repository on your [GitHub account](https://github.com/new). Do not initialize it with a README or License.
2. Link your local project to the remote GitHub repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Deploy to Streamlit Community Cloud (Free)
1. Go to [share.streamlit.io](https://share.streamlit.io/) and log in with your GitHub account.
2. Click **New app**.
3. Select your repository (`YOUR_USERNAME/YOUR_REPOSITORY_NAME`), branch (`main`), and set the main file path to `app.py`.
4. Click **Deploy!** 

Your dashboard will spin up in the cloud and be accessible globally for free.
