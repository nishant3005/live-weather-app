// src/components/WeatherApp.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { TailSpin as Loader } from 'react-loader-spinner';

const WeatherApp = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetching weather data
    const fetchWeatherData = async () => {
      try {
        const location = await getCurrentLocation();
        const response = await axios.post(
          'https://live-weather-app-backend-1.onrender.com/api/weather',
          location
        );
        setWeatherData(response.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        toast.error('Failed to fetch weather data.');
      }
    };

    fetchWeatherData();

    // Set up WebSocket connection for real-time updates
    const socket = io('https://live-weather-app-backend-1.onrender.com/');

    socket.on('weatherUpdate', (updatedData) => {
      setWeatherData(updatedData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error(error);
          reject(error);
        }
      );
    });
  };

  const renderWeatherImage = () => {
    if (!weatherData) return null;

    const weatherIconUrl = `http://openweathermap.org/img/w/${weatherData.icon}.png`;

    return (
      <img src={weatherIconUrl} alt="Weather Icon" className="weather-image" />
    );
  };

  const convertKelvinToCelsius = (kelvin) => {
    return (kelvin - 273.15).toFixed(2);
  };

  return (
    <div className="box">
      <div>
        {loading ? (
          <>
            <Loader type="TailSpin" color="#00BFFF" height={80} width={80} />
          </>
        ) : (
          <div className="weather-container">
            <div className="">
              <div className="d-flex align-items-center">
                <div className="pe-3 w-30 fs-4">
                  <FontAwesomeIcon icon={faLocationDot} />
                </div>
                <div className="fw-bold fs-5">{weatherData.location}</div>
              </div>
              <div className="fw-semibold fs-1">
                {convertKelvinToCelsius(weatherData.temperature)} °C
              </div>
            </div>
            <div>
              <div>{renderWeatherImage()}</div>
              <div className="fs-5 text-capitalize fw-semibold">
                {weatherData.description}
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default WeatherApp;
