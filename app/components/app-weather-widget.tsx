import React, { useMemo } from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, Wind, Droplets } from 'lucide-react';

interface WeatherWidgetProps {
  temperature?: number; // in Fahrenheit
  precipitation?: number; // in inches
  windSpeed?: number; // in mph
  windDirection?: number; // in degrees
}

export function WeatherWidget({
  temperature,
  precipitation,
  windSpeed,
  windDirection,
}: WeatherWidgetProps) {
  // Determine condition based on precipitation
  const condition = useMemo(() => {
    if (precipitation === undefined) return 'clouds';
    if (precipitation > 0) return 'rain';
    return 'clear';
  }, [precipitation]);

  // Calculate feels like temperature (simple wind chill approximation)
  const feelsLike = useMemo(() => {
    if (temperature === undefined) return undefined;
    if (windSpeed === undefined || windSpeed < 3) return temperature;
    // Simple wind chill formula approximation
    const windChill = 35.74 + 0.6215 * temperature - 35.75 * Math.pow(windSpeed, 0.16) + 0.4275 * temperature * Math.pow(windSpeed, 0.16);
    return Math.round(windChill);
  }, [temperature, windSpeed]);

  // Estimate humidity based on temperature and precipitation (rough approximation)
  const humidity = useMemo(() => {
    if (precipitation === undefined || temperature === undefined) return undefined;
    // Higher precipitation = higher humidity
    // Lower temperature = potentially higher humidity
    let baseHumidity = 50;
    if (precipitation > 0) {
      baseHumidity = Math.min(95, 50 + precipitation * 20);
    }
    // Adjust based on temperature (warmer = potentially lower humidity, but this is very rough)
    if (temperature > 80) {
      baseHumidity = Math.max(30, baseHumidity - 10);
    } else if (temperature < 50) {
      baseHumidity = Math.min(90, baseHumidity + 15);
    }
    return Math.round(baseHumidity);
  }, [precipitation, temperature]);

  const unit = '°F';
  const windUnit = 'mph';
  const city = 'College Station'; // Location from API (30.628, -96.3344)

  const getBackgroundColor = () => {
    if (condition === 'clear') return 'from-blue-400 via-blue-300 to-blue-200';
    if (condition === 'rain') return 'from-gray-800 via-gray-700 to-gray-600';
    return 'from-blue-500 via-blue-400 to-blue-300';
  };

  const getWeatherIcon = () => {
    if (condition === 'clear') {
      return (
        <div className="relative w-24 h-24 mb-4">
          <Sun className="w-24 h-24 text-yellow-400 drop-shadow-2xl" fill="currentColor" />
        </div>
      );
    }
    if (condition === 'rain') {
      return (
        <div className="relative w-24 h-24 mb-4">
          <Cloud className="w-24 h-24 text-gray-400" fill="currentColor" />
          <Droplets className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 text-blue-400" />
        </div>
      );
    }
    return (
      <div className="relative w-24 h-24 mb-4">
        <Cloud className="w-20 h-20 text-white opacity-90 absolute right-0 bottom-2" fill="currentColor" />
        <Sun className="w-16 h-16 text-yellow-300 absolute left-0 top-0" fill="currentColor" />
      </div>
    );
  };

  const getConditionText = () => {
    if (condition === 'clear') return 'clear sky';
    if (condition === 'rain') return 'light intensity shower rain';
    return 'few clouds';
  };

  const getTextColor = () => {
    return condition === 'rain' ? 'text-white' : 'text-white';
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="flex gap-6 flex-wrap justify-center">
        {/* Main Weather Card */}
        <div className={`w-80 h-[450px] rounded-2xl bg-gradient-to-br ${getBackgroundColor()} shadow-xl p-6 flex flex-col items-center justify-between relative overflow-hidden`}>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-80 h-80 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full h-full justify-between">
            {/* City Name */}
            <h2 className={`text-2xl font-bold ${getTextColor()} mb-2`}>{city}</h2>

            {/* Weather Icon */}
            {getWeatherIcon()}

            {/* Temperature */}
            <div className="text-center mb-3">
              <div className={`text-6xl font-bold ${getTextColor()} tracking-tight`}>
                {temperature !== undefined ? Math.round(temperature) : '--'}
                <span className="text-4xl align-top">{unit}</span>
              </div>
              <p className={`text-base ${getTextColor()} opacity-90 mt-1`}>{getConditionText()}</p>
            </div>

            {/* Weather Details */}
            <div className={`w-full grid grid-cols-3 gap-3 ${getTextColor()}`}>
              <div className="text-center">
                <p className="text-xs opacity-75 mb-1">Wind</p>
                <p className="text-lg font-semibold">
                  {windSpeed !== undefined ? Math.round(windSpeed) : '--'}
                  <span className="text-xs">{windUnit}</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-75 mb-1">Humidity</p>
                <p className="text-lg font-semibold">
                  {humidity !== undefined ? humidity : '--'}
                  <span className="text-xs">%</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs opacity-75 mb-1">Feels like</p>
                <p className="text-lg font-semibold">
                  {feelsLike !== undefined ? feelsLike : '--'}
                  <span className="text-xs">{unit}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}