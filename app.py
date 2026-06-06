import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from io import BytesIO

# ==========================================
# 1. PAGE SETUP
# ==========================================
st.set_page_config(
    page_title="Customer Churn Analysis Dashboard",
    page_icon="📊",
    layout="wide"
)

# ==========================================
# 2. HELPER FUNCTIONS & FORMATTERS
# ==========================================
def format_indian_currency(amount):
    """
    Format monetary amounts using the Indian Rupee system.
    Example: 1234567.89 -> ₹12,34,567.89
    """
    if pd.isna(amount) or amount is None:
        return "₹0.00"
    try:
        amount = float(amount)
    except ValueError:
        return "₹0.00"
        
    negative = amount < 0
    amount = abs(amount)
    
    s = f"{amount:.2f}"
    parts = s.split('.')
    int_part = parts[0]
    dec_part = parts[1]
    
    if len(int_part) <= 3:
        formatted_int = int_part
    else:
        last_three = int_part[-3:]
        remaining = int_part[:-3]
        groups = []
        while len(remaining) > 0:
            if len(remaining) >= 2:
                groups.append(remaining[-2:])
                remaining = remaining[:-2]
            else:
                groups.append(remaining)
                remaining = ""
        groups.reverse()
        formatted_int = ",".join(groups) + "," + last_three
        
    sign = "-" if negative else ""
    return f"{sign}₹{formatted_int}.{dec_part}"


# ==========================================
# 3. DEMO DATA GENERATION
# ==========================================
@st.cache_data
def generate_synthetic_data(seed=42):
    """
    Generates a high-quality, realistic customer churn dataset.
    Customized to exhibit clear correlations for insights and risk segments.
    """
    np.random.seed(seed)
    n_samples = 1000
    
    customer_ids = [f"{np.random.randint(1000, 9999)}-{np.random.choice(['ABCD', 'WXYZ', 'PQRS', 'JKLM'])}{i}" for i in range(n_samples)]
    genders = np.random.choice(['Male', 'Female'], size=n_samples)
    contracts = np.random.choice(['Month-to-month', 'One year', 'Two year'], size=n_samples, p=[0.55, 0.25, 0.20])
    payment_methods = np.random.choice(['Electronic check', 'Mailed check', 'Bank transfer', 'Credit card'], size=n_samples, p=[0.35, 0.25, 0.20, 0.20])
    internet_services = np.random.choice(['Fiber optic', 'DSL', 'No'], size=n_samples, p=[0.45, 0.35, 0.20])
    
    monthly_charges = []
    tenures = []
    
    for i in range(n_samples):
        if internet_services[i] == 'Fiber optic':
            charge = np.random.normal(loc=1800, scale=350)
        elif internet_services[i] == 'DSL':
            charge = np.random.normal(loc=999, scale=200)
        else:
            charge = np.random.normal(loc=350, scale=100)
        
        charge = max(199.0, min(charge, 2799.0))
        monthly_charges.append(round(charge, 2))
        
        if contracts[i] == 'Month-to-month':
            tenure = np.random.geometric(p=0.08)
        elif contracts[i] == 'One year':
            tenure = np.random.normal(loc=24, scale=8)
        else:
            tenure = np.random.normal(loc=55, scale=12)
            
        tenure = max(0, min(int(tenure), 72))
        tenures.append(tenure)
        
    monthly_charges = np.array(monthly_charges)
    tenures = np.array(tenures)
    total_charges = monthly_charges * tenures
    
    # Introduce some missing/blank total charges
    total_charges_raw = []
    for tc, t in zip(total_charges, tenures):
        if t == 0:
            total_charges_raw.append(" ")
        elif np.random.rand() < 0.015:
            total_charges_raw.append("")
        elif np.random.rand() < 0.01:
            total_charges_raw.append(np.nan)
        else:
            total_charges_raw.append(str(round(tc, 2)))

    # Compute Churn using custom probabilities
    churn_labels = []
    for i in range(n_samples):
        p_churn = 0.05
        if contracts[i] == 'Month-to-month':
            p_churn += 0.35
        if internet_services[i] == 'Fiber optic':
            p_churn += 0.15
        if payment_methods[i] == 'Electronic check':
            p_churn += 0.12
        if monthly_charges[i] > 1500:
            p_churn += 0.10
        if tenures[i] > 36:
            p_churn -= 0.20
        elif tenures[i] > 12:
            p_churn -= 0.10
        else:
            p_churn += 0.15
            
        p_churn = max(0.02, min(p_churn, 0.95))
        churn_val = 'Yes' if np.random.rand() < p_churn else 'No'
        churn_labels.append(churn_val)
        
    df = pd.DataFrame({
        'CustomerID': customer_ids,
        'Gender': genders,
        'Contract': contracts,
        'PaymentMethod': payment_methods,
        'InternetService': internet_services,
        'Tenure': tenures,
        'MonthlyCharges': monthly_charges,
        'TotalCharges': total_charges_raw,
        'Churn': churn_labels
    })
    
    return df


# ==========================================
# 4. DATA CLEANING
# ==========================================
def clean_dataset(df):
    """
    Cleans missing values, strips whitespace, converts strings to floats,
    and returns the cleaned DataFrame and a dictionary of cleaning metadata.
    """
    metadata = {}
    cleaned = df.copy()
    
    # 1. Total Charges Clean
    if 'TotalCharges' in cleaned.columns:
        cleaned['TotalCharges'] = cleaned['TotalCharges'].astype(str).str.strip()
        blanks = (cleaned['TotalCharges'] == '').sum() | (cleaned['TotalCharges'] == 'nan').sum()
        metadata['total_charges_blanks'] = blanks
        
        cleaned['TotalCharges'] = cleaned['TotalCharges'].replace(['', 'nan', 'None'], np.nan)
        cleaned['TotalCharges'] = pd.to_numeric(cleaned['TotalCharges'], errors='coerce')
        
        missing_count = cleaned['TotalCharges'].isna().sum()
        metadata['total_charges_missing_imputed'] = missing_count
        
        if 'Tenure' in cleaned.columns and 'MonthlyCharges' in cleaned.columns:
            mask = cleaned['TotalCharges'].isna()
            cleaned.loc[mask, 'TotalCharges'] = cleaned.loc[mask, 'Tenure'] * cleaned.loc[mask, 'MonthlyCharges']
            
        median_tc = cleaned['TotalCharges'].median()
        cleaned['TotalCharges'] = cleaned['TotalCharges'].fillna(median_tc if not pd.isna(median_tc) else 0)
        
    # 2. Monthly Charges Clean
    if 'MonthlyCharges' in cleaned.columns:
        missing_mc = cleaned['MonthlyCharges'].isna().sum()
        metadata['monthly_charges_missing'] = missing_mc
        cleaned['MonthlyCharges'] = pd.to_numeric(cleaned['MonthlyCharges'], errors='coerce')
        median_mc = cleaned['MonthlyCharges'].median()
        cleaned['MonthlyCharges'] = cleaned['MonthlyCharges'].fillna(median_mc if not pd.isna(median_mc) else 0)
        
    # 3. Tenure Clean
    if 'Tenure' in cleaned.columns:
        missing_tenure = cleaned['Tenure'].isna().sum()
        metadata['tenure_missing'] = missing_tenure
        cleaned['Tenure'] = pd.to_numeric(cleaned['Tenure'], errors='coerce')
        cleaned['Tenure'] = cleaned['Tenure'].fillna(0).astype(int)
        
    # 4. Categorical normalization
    categorical_cols = ['Gender', 'Contract', 'PaymentMethod', 'InternetService', 'Churn']
    for col in categorical_cols:
        if col in cleaned.columns:
            cleaned[col] = cleaned[col].astype(str).str.strip()
            cleaned[col] = cleaned[col].replace(['', 'nan', 'None', 'unknown', 'Null'], 'Not Specified')
            cleaned[col] = cleaned[col].fillna('Not Specified')
            
            if col == 'Churn':
                cleaned[col] = cleaned[col].apply(
                    lambda x: 'Yes' if str(x).lower() in ['yes', '1', 'true', 'y', 'churned'] 
                    else ('No' if str(x).lower() in ['no', '0', 'false', 'n', 'active'] else 'No')
                )
                
    return cleaned, metadata


# ==========================================
# 5. CORE LAYOUT & SIDEBAR FILTERING
# ==========================================
st.sidebar.title("Dashboard Settings")

# CSV File Uploader
uploaded_file = st.sidebar.file_uploader("Upload Customer CSV Dataset", type=["csv"])

if uploaded_file is not None:
    try:
        raw_df = pd.read_csv(uploaded_file)
        st.sidebar.success("Custom dataset loaded!")
        is_synthetic = False
    except Exception as e:
        st.sidebar.error(f"Error loading CSV: {e}")
        raw_df = generate_synthetic_data()
        is_synthetic = True
else:
    raw_df = generate_synthetic_data()
    st.sidebar.info("Using synthetic demo data. Upload your own CSV above.")
    is_synthetic = True

# Process & Clean data
df_cleaned, clean_logs = clean_dataset(raw_df)

# Check required columns
required_cols = ['Gender', 'Contract', 'PaymentMethod', 'InternetService', 'Tenure', 'MonthlyCharges', 'TotalCharges', 'Churn']
missing_required = [col for col in required_cols if col not in df_cleaned.columns]

if missing_required:
    st.error(f"Missing required columns in dataset: {', '.join(missing_required)}")
    st.stop()

# Interactive Filters
st.sidebar.subheader("Filter Customers")

genders = sorted(df_cleaned['Gender'].unique())
selected_gender = st.sidebar.multiselect("Gender", options=genders, default=genders)

contracts = sorted(df_cleaned['Contract'].unique())
selected_contract = st.sidebar.multiselect("Contract Type", options=contracts, default=contracts)

payments = sorted(df_cleaned['PaymentMethod'].unique())
selected_payment = st.sidebar.multiselect("Payment Method", options=payments, default=payments)

internets = sorted(df_cleaned['InternetService'].unique())
selected_internet = st.sidebar.multiselect("Internet Service", options=internets, default=internets)

churns = ['Yes', 'No']
selected_churn = st.sidebar.multiselect("Churn Status", options=churns, default=churns)

if st.sidebar.button("Reset Filters", use_container_width=True):
    st.rerun()

# Apply filters
df_filtered = df_cleaned[
    (df_cleaned['Gender'].isin(selected_gender)) &
    (df_cleaned['Contract'].isin(selected_contract)) &
    (df_cleaned['PaymentMethod'].isin(selected_payment)) &
    (df_cleaned['InternetService'].isin(selected_internet)) &
    (df_cleaned['Churn'].isin(selected_churn))
]

# Header Row
st.title("📊 Customer Churn Analysis Dashboard")
if is_synthetic:
    st.caption("Visualizing synthetic telecommunication demo records.")
else:
    st.caption(f"Visualizing uploaded dataset ({len(raw_df)} records).")

# Data Cleaning Stats
with st.expander("Data Cleaning & Ingestion Logs"):
    st.write(f"- **Total Ingested Rows**: {len(raw_df)}")
    st.write(f"- **Missing Total Charges Fixed**: {clean_logs.get('total_charges_missing_imputed', 0)}")
    st.write("- **Casing and Category Values Standardized**: Yes")

if df_filtered.empty:
    st.warning("No data matches the selected filters.")
    st.stop()


# ==========================================
# 6. KPI METRICS
# ==========================================
total_cust = len(df_filtered)
churned_cust = len(df_filtered[df_filtered['Churn'] == 'Yes'])
active_cust = len(df_filtered[df_filtered['Churn'] == 'No'])
churn_rate = (churned_cust / total_cust * 100) if total_cust > 0 else 0.0

col_k1, col_k2, col_k3, col_k4 = st.columns(4)
col_k1.metric("Total Customers", f"{total_cust:,}")
col_k2.metric("Churned Customers", f"{churned_cust:,}")
col_k3.metric("Active Customers", f"{active_cust:,}")
col_k4.metric("Churn Rate (%)", f"{churn_rate:.2f}%")


# ==========================================
# 7. INTERACTIVE CHARTS
# ==========================================
st.write("")
st.subheader("Interactive Visualizations")

tab1, tab2 = st.tabs(["Demographics & Categories", "Charges & Tenure Density"])

with tab1:
    col_t1_1, col_t1_2 = st.columns(2)
    
    with col_t1_1:
        # Churn by Gender
        gender_churn = df_filtered.groupby(['Gender', 'Churn']).size().reset_index(name='Count')
        fig_gender = px.bar(
            gender_churn, x='Gender', y='Count', color='Churn',
            title='Churn by Gender',
            color_discrete_map={'Yes': '#FF5C5C', 'No': '#00E676'},
            barmode='group'
        )
        st.plotly_chart(fig_gender, use_container_width=True)
        
        # Churn by Payment Method
        pay_churn = df_filtered.groupby(['PaymentMethod', 'Churn']).size().reset_index(name='Count')
        fig_pay = px.bar(
            pay_churn, y='PaymentMethod', x='Count', color='Churn',
            title='Churn by Payment Method',
            color_discrete_map={'Yes': '#FF5C5C', 'No': '#00E676'},
            barmode='group', orientation='h'
        )
        st.plotly_chart(fig_pay, use_container_width=True)
        
    with col_t1_2:
        # Churn by Contract Type
        contract_churn = df_filtered.groupby(['Contract', 'Churn']).size().reset_index(name='Count')
        fig_contract = px.bar(
            contract_churn, x='Contract', y='Count', color='Churn',
            title='Churn by Contract Type',
            color_discrete_map={'Yes': '#FF5C5C', 'No': '#00E676'},
            barmode='group'
        )
        st.plotly_chart(fig_contract, use_container_width=True)
        
        # Churn by Internet Service
        internet_churn = df_filtered.groupby(['InternetService', 'Churn']).size().reset_index(name='Count')
        fig_internet = px.bar(
            internet_churn, x='InternetService', y='Count', color='Churn',
            title='Churn by Internet Service',
            color_discrete_map={'Yes': '#FF5C5C', 'No': '#00E676'},
            barmode='group'
        )
        st.plotly_chart(fig_internet, use_container_width=True)

with tab2:
    col_t2_1, col_t2_2 = st.columns(2)
    
    with col_t2_1:
        # Monthly Charges Distribution
        fig_monthly = px.histogram(
            df_filtered, x='MonthlyCharges', color='Churn',
            title='Monthly Charges Distribution (in INR)',
            color_discrete_map={'Yes': '#FF5C5C', 'No': '#00E676'},
            opacity=0.65, barmode='overlay',
            labels={'MonthlyCharges': 'Monthly Charges (₹)'}
        )
        st.plotly_chart(fig_monthly, use_container_width=True)
        
    with col_t2_2:
        # Tenure Distribution
        fig_tenure = px.histogram(
            df_filtered, x='Tenure', color='Churn',
            title='Tenure Distribution (in Months)',
            color_discrete_map={'Yes': '#FF5C5C', 'No': '#00E676'},
            opacity=0.65, barmode='overlay',
            labels={'Tenure': 'Tenure (Months)'}
        )
        st.plotly_chart(fig_tenure, use_container_width=True)
        
    # Churn vs Monthly Charges Scatter Plot
    fig_scatter = px.scatter(
        df_filtered, x='Tenure', y='MonthlyCharges', color='Churn',
        color_discrete_map={'Yes': '#FF5C5C', 'No': '#00E676'},
        opacity=0.6, size='MonthlyCharges',
        title='Churn vs Monthly Charges Scatter Plot',
        labels={'Tenure': 'Tenure (Months)', 'MonthlyCharges': 'Monthly Charges (₹)'}
    )
    st.plotly_chart(fig_scatter, use_container_width=True)


# ==========================================
# 8. TOP RISK SEGMENTS ENGINE
# ==========================================
st.write("")
st.subheader("🚨 Top Churn Risk Segments")

# Calculate risk segments
def identify_risk_segments(df):
    segments = []
    combinations = [
        ('Contract', 'InternetService'),
        ('Contract', 'PaymentMethod'),
        ('InternetService', 'PaymentMethod')
    ]
    overall_churn_rate = (df['Churn'] == 'Yes').mean()
    
    for col1, col2 in combinations:
        grouped = df.groupby([col1, col2])
        for name, group in grouped:
            total = len(group)
            if total >= max(10, int(len(df) * 0.03)):
                churn_count = (group['Churn'] == 'Yes').sum()
                segment_churn_rate = (churn_count / total) * 100
                
                if segment_churn_rate > max(35.0, overall_churn_rate * 100 * 1.2):
                    segments.append({
                        'Segment': f"{name[0]} ({col1}) & {name[1]} ({col2})",
                        'Churn Rate': segment_churn_rate,
                        'Total Customers': total,
                        'Churned Customers': churn_count
                    })
                    
    segments = sorted(segments, key=lambda x: x['Churn Rate'], reverse=True)
    return segments[:3]

risk_segments = identify_risk_segments(df_filtered)

if risk_segments:
    col_rs1, col_rs2, col_rs3 = st.columns(3)
    cols = [col_rs1, col_rs2, col_rs3]
    for idx, seg in enumerate(risk_segments):
        with cols[idx]:
            severity = "Critical Risk" if seg['Churn Rate'] >= 50 else "High Risk"
            st.warning(
                f"**{severity}**\n\n"
                f"**Cohort**: {seg['Segment']}\n\n"
                f"- **Churn Rate**: {seg['Churn Rate']:.1f}%\n"
                f"- **Volume**: {seg['Churned Customers']} lost / {seg['Total Customers']} total"
            )
else:
    st.success("No high risk segments (Churn Rate > 35%) identified in the current cohort.")


# ==========================================
# 9. AUTOMATED INSIGHTS PANEL
# ==========================================
st.write("")
st.subheader("💡 Automated Insights & Recommended Actions")

insights_list = []
recommendations = []

# Logic 1: Contract Analysis
contract_groups = df_filtered.groupby('Contract')
if len(contract_groups) > 1:
    m2m_churn = df_filtered[df_filtered['Contract'] == 'Month-to-month']['Churn']
    m2m_rate = (m2m_churn == 'Yes').mean() * 100 if len(m2m_churn) > 0 else 0
    long_term_churn = df_filtered[df_filtered['Contract'].isin(['One year', 'Two year'])]['Churn']
    long_term_rate = (long_term_churn == 'Yes').mean() * 100 if len(long_term_churn) > 0 else 0
    
    if m2m_rate > long_term_rate:
        diff_factor = (m2m_rate / long_term_rate) if long_term_rate > 0 else 0
        insights_list.append(
            f"Month-to-month contracts have a **{m2m_rate:.1f}%** churn rate, "
            f"which is **{diff_factor:.1f}x** higher than long-term annual contracts (**{long_term_rate:.1f}%**)."
        )
        recommendations.append("Offer incentives or discounts to transition month-to-month subscribers to 1-year contract plans.")

# Logic 2: Pricing Risk
churned_charges = df_filtered[df_filtered['Churn'] == 'Yes']['MonthlyCharges'].mean()
active_charges = df_filtered[df_filtered['Churn'] == 'No']['MonthlyCharges'].mean()

if not pd.isna(churned_charges) and not pd.isna(active_charges):
    diff_pct = ((churned_charges / active_charges) - 1) * 100 if active_charges > 0 else 0
    formatted_churn_c = format_indian_currency(churned_charges)
    formatted_active_c = format_indian_currency(active_charges)
    
    if diff_pct > 5:
        insights_list.append(
            f"Lost subscribers had a higher average monthly rate of **{formatted_churn_c}** "
            f"(**{diff_pct:.1f}% higher** than average active customer rate of **{formatted_active_c}**)."
        )
        recommendations.append("Provide discount options or alerts for customers whose billing amounts exceed typical active ranges.")

# Logic 3: Payment Type
pay_groups = df_filtered.groupby('PaymentMethod')
if len(pay_groups) > 1:
    pay_churn_rates = df_filtered.groupby('PaymentMethod')['Churn'].apply(lambda x: (x == 'Yes').mean() * 100)
    max_pay_method = pay_churn_rates.idxmax()
    max_pay_rate = pay_churn_rates.max()
    
    if max_pay_rate > 30:
        insights_list.append(
            f"Subscribers paying via **{max_pay_method}** show high churn rates of **{max_pay_rate:.1f}%**."
        )
        recommendations.append(f"Incentivize auto-pay or direct bank transfer enrollment for customers currently paying via {max_pay_method}.")

# Logic 4: Life cycles
churned_tenure = df_filtered[df_filtered['Churn'] == 'Yes']['Tenure'].mean()
active_tenure = df_filtered[df_filtered['Churn'] == 'No']['Tenure'].mean()

if not pd.isna(churned_tenure) and not pd.isna(active_tenure):
    insights_list.append(
        f"Lost accounts had an average tenure of **{churned_tenure:.1f} months**, "
        f"compared to **{active_tenure:.1f} months** for active accounts."
    )
    recommendations.append("Focus customer onboarding support during the critical early months (months 1-6) of subscription lifecycle.")

# Render Insights
col_ins1, col_ins2 = st.columns(2)
with col_ins1:
    st.markdown("### Key Observations")
    for ins in insights_list:
        st.info(ins)

with col_ins2:
    st.markdown("### Action Plan")
    for rec in recommendations:
        st.success(rec)


# ==========================================
# 10. EXPORTS & REPORTS
# ==========================================
st.write("")
st.divider()
st.subheader("📥 Export Reports")

csv_data = df_filtered.to_csv(index=False).encode('utf-8')

# Summary Text Report Generation
summary_report = f"""==================================================
CUSTOMER CHURN REPORT SUMMARY
Generated on: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}
==================================================

KEY METRICS:
--------------------------------------------------
Total Customers: {total_cust}
Churned Customers: {churned_cust}
Active Customers: {active_cust}
Overall Churn Rate: {churn_rate:.2f}%

KEY INSIGHTS:
--------------------------------------------------
"""
for idx, ins in enumerate(insights_list):
    clean_ins = ins.replace('**', '')
    summary_report += f"{idx+1}. {clean_ins}\n"

summary_report += """
RECOMMENDED RETENTION ACTIONS:
--------------------------------------------------
"""
for idx, rec in enumerate(recommendations):
    summary_report += f"- [ ] {rec}\n"

summary_report += """
TOP HIGH RISK SEGMENTS:
--------------------------------------------------
"""
if risk_segments:
    for idx, seg in enumerate(risk_segments):
        summary_report += f"{idx+1}. {seg['Segment']}\n"
        summary_report += f"   Churn rate: {seg['Churn Rate']:.1f}% | Total size: {seg['Total Customers']}\n"
else:
    summary_report += "No high-risk segments found.\n"

summary_report += "\n==================== END ===================="

# Export Buttons
col_btn1, col_btn2 = st.columns(2)
with col_btn1:
    st.download_button(
        label="Download Filtered Data (CSV)",
        data=csv_data,
        file_name="filtered_customer_data.csv",
        mime="text/csv",
        use_container_width=True
    )
with col_btn2:
    st.download_button(
        label="Download Business Summary Report (TXT)",
        data=summary_report,
        file_name="churn_summary_report.txt",
        mime="text/plain",
        use_container_width=True
    )
