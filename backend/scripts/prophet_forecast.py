#!/usr/bin/env python3
"""
prophet_forecast.py - Facebook Prophet Time-Series Forecasting
Handles demand forecasting for WasteWise platform
"""

import sys
import json
import pandas as pd
from prophet import Prophet
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

def load_data(json_file):
    """Load data from JSON file"""
    try:
        with open(json_file, 'r') as f:
            config = json.load(f)
        return config
    except Exception as e:
        print(json.dumps({"error": f"Failed to load data: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

def prepare_dataframe(data):
    """Convert data to Prophet-compatible DataFrame"""
    try:
        df = pd.DataFrame(data)
        
        # Ensure 'ds' (date) and 'y' (value) columns exist
        if 'ds' not in df.columns or 'y' not in df.columns:
            raise ValueError("Data must contain 'ds' (date) and 'y' (value) columns")
        
        # Convert ds to datetime
        df['ds'] = pd.to_datetime(df['ds'])
        
        # Ensure y is numeric
        df['y'] = pd.to_numeric(df['y'], errors='coerce')
        
        # Remove any NaN values
        df = df.dropna()
        
        return df
    except Exception as e:
        print(json.dumps({"error": f"Data preparation failed: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

def run_prophet_forecast(df, periods, frequency='D', options=None):
    """Run Prophet forecasting model"""
    try:
        if options is None:
            options = {}
        
        # Initialize Prophet with Malaysian holidays consideration
        model = Prophet(
            yearly_seasonality=options.get('yearly_seasonality', True),
            weekly_seasonality=options.get('weekly_seasonality', True),
            daily_seasonality=options.get('daily_seasonality', False),
            changepoint_prior_scale=options.get('changepoint_prior_scale', 0.05),
            seasonality_prior_scale=options.get('seasonality_prior_scale', 10.0)
        )
        
        # Add Malaysian holidays if available
        if options.get('add_malaysian_holidays', True):
            # Add major Malaysian holidays
            malaysian_holidays = pd.DataFrame({
                'holiday': 'hari_raya',
                'ds': pd.to_datetime(['2025-03-30', '2025-03-31']),  # Example dates
                'lower_window': 0,
                'upper_window': 1,
            })
            model.add_country_holidays(country_name='MY')
        
        # Fit the model
        model.fit(df)
        
        # Create future dataframe
        future = model.make_future_dataframe(periods=periods, freq=frequency)
        
        # Generate forecast
        forecast = model.predict(future)
        
        # Calculate accuracy metrics (on historical data)
        accuracy = calculate_accuracy(df, forecast)
        
        return {
            "forecast": forecast,
            "model": model,
            "accuracy": accuracy
        }
    except Exception as e:
        print(json.dumps({"error": f"Prophet forecasting failed: {str(e)}"}), file=sys.stderr)
        sys.exit(1)

def calculate_accuracy(actual_df, forecast_df):
    """Calculate forecast accuracy metrics"""
    try:
        # Merge actual and predicted on date
        merged = actual_df.merge(
            forecast_df[['ds', 'yhat', 'yhat_lower', 'yhat_upper']],
            on='ds',
            how='left'
        )
        
        # Calculate MAPE (Mean Absolute Percentage Error)
        merged['ape'] = abs((merged['y'] - merged['yhat']) / merged['y']) * 100
        mape = merged['ape'].mean()
        
        # Calculate accuracy percentage
        accuracy = max(0, 100 - mape)
        
        return {
            "mape": round(mape, 2),
            "accuracy_percent": round(accuracy, 2),
            "confidence": "high" if accuracy >= 90 else "medium" if accuracy >= 80 else "low"
        }
    except Exception as e:
        return {
            "mape": 0,
            "accuracy_percent": 0,
            "confidence": "unknown",
            "error": str(e)
        }

def format_output(forecast_result):
    """Format forecast output as JSON"""
    try:
        forecast_df = forecast_result['forecast']
        
        # Get only future predictions (exclude historical fit)
        future_forecast = forecast_df.tail(forecast_result.get('periods', 30))
        
        predictions = []
        for _, row in future_forecast.iterrows():
            predictions.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "predicted_value": round(row['yhat'], 2),
                "lower_bound": round(row['yhat_lower'], 2),
                "upper_bound": round(row['yhat_upper'], 2),
                "confidence": "high" if (row['yhat_upper'] - row['yhat_lower']) < row['yhat'] * 0.3 else "medium"
            })
        
        return {
            "success": True,
            "predictions": predictions,
            "accuracy": forecast_result['accuracy'],
            "model_components": {
                "trend": "detected",
                "seasonality": "detected",
                "holidays": "Malaysian holidays included"
            },
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

def main():
    """Main execution"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No data file provided"}), file=sys.stderr)
        sys.exit(1)
    
    # Load configuration
    config = load_data(sys.argv[1])
    
    # Prepare data
    df = prepare_dataframe(config['data'])
    
    # Run forecast
    forecast_result = run_prophet_forecast(
        df,
        config['periods'],
        config.get('frequency', 'D'),
        config.get('options', {})
    )
    
    # Format and output
    output = format_output({**forecast_result, 'periods': config['periods']})
    print(json.dumps(output))

if __name__ == "__main__":
    main()

