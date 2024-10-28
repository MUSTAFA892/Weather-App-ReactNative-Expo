import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from "expo-status-bar";
import { CalendarDaysIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import {MapPinIcon} from "react-native-heroicons/solid";
import {debounce} from 'lodash';
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from 'react-native-progress';
import { getData, storeData } from "../utils/asyncStorage";

const theme = {
  bgWhite: (opacity) => `rgba(255, 255, 255, ${opacity})`,
};

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations , setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  

  const handleLocation = (loc) => {
    console.log('location:',loc);
    setLocations([])
    toggleSearch(false);
    setLoading(true)
    fetchWeatherForecast({
      cityName: loc.name,
      days : '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false);
      storeData('city', loc.name);
      //console.log('got forecast: ',data)
    })
  }
  
  
  const handleSearch = value => {
    // Fetch locations
    if(value.length > 2){
      fetchLocations({cityName : value}).then(data => {
        console.log(data);
        setLocations(data);
        
      })
    }

  }

  useEffect(()=>{
    fetchMyWeatherData();
  },[]);

  const fetchMyWeatherData = async () => {
    let myCity = await getData('city');
    let cityName = 'Coimbatore'
    if (myCity) cityName = myCity;
     fetchWeatherForecast({
      cityName,
      days : '7'
    }).then(data=>{
      setWeather(data);
      setLoading(false);
    })
  }


  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])
  const {current , location} = weather;
  
  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require('../assets/images/bg.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      {
        loading?(
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Progress.CircleSnail thickness={10} size ={140} color = "#0bb3b2" /> 
          </View>
      ):(
          <SafeAreaView style={{ flex: 1, marginTop: 50 }}>
            <View style={{ height: '6%', marginHorizontal: 16, position: 'relative', zIndex: 50 }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  borderRadius: 50,
                  backgroundColor: showSearch? theme.bgWhite(0.2): 'transparent',
                  paddingVertical: 10,
                }}
              >
                {showSearch ? (
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search city"
                    placeholderTextColor="lightgray"
                    style={{
                      paddingLeft: 16,
                      height: 40,
                      flex: 1,
                      fontSize: 16,
                      color: 'white',
                    }}
                  />
                ) : null}

                <TouchableOpacity
                  onPress={() => toggleSearch(!showSearch)}
                  style={{
                    backgroundColor: theme.bgWhite(0.3),
                    borderRadius: 50,
                    padding: 10,
                    height: 40,
                    weight: 40,
                    width: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 4,
                  }}
                >
                  <MagnifyingGlassIcon size={30} color="white" m />
                </TouchableOpacity>
              </View>
              {
          locations.length > 0 && showSearch ? (
            <View style={{ position: 'absolute', width: '100%', backgroundColor: '#d1d5db', top: 60, borderRadius: 24 }}>
              {
                locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 12,
                        paddingHorizontal: 16,
                        marginBottom: 4,
                        borderBottomWidth: showBorder ? 2 : 0,
                        borderBottomColor: '#9ca3af',
                      }}
                    >
                      <MapPinIcon size={20} color="gray" />
                      <Text style={{ marginLeft: 8, color: '#000', fontSize: 16 }}>{loc?.name}, {loc?.country}</Text>
                    </TouchableOpacity>
                  );
                })
              }
            </View>
          ) : null
        }

            </View>
            {/* Forecast Section */}
            <View style={{ marginHorizontal: 16, justifyContent: 'space-around', flex: 1, marginBottom: 8 }}>
          {/* Locations */}
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 24, fontWeight: 'bold' }}>
            {location?.name},
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#d1d5db' }}> 
              {" "+location?.country}
              </Text>
          </Text>
          
          {/* Weather Image */}
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Image 
              source={weatherImages[current?.condition?.text]}
              style={{ width: 208, height: 208 }} // 52 * 4
            />
          </View>
          
          {/* Degree Celsius */}
          <View style={{ marginTop: 8 }}>
            <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 64, marginLeft: 20 }}>
              {current?.temp_c}&#176;
            </Text>
            <Text style={{ textAlign: 'center', color: 'white', fontSize: 20, letterSpacing: 2 }}

            >
              {current?.condition?.text}
            </Text>
          </View>
          {/* Other Stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source = {require("../assets/icons/wind.png")} style={{ height: 24, width: 24 }}/>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                {current?.wind_kph}Km
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source = {require("../assets/icons/drop.png")} style={{ height: 24, width: 24 }}/>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                {current?.humidity}%
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source = {require("../assets/icons/sun.png")} style={{ height: 24, width: 24 }}/>
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                {weather?.forecast?.forecastday[0]?.astro?.sunrise}
              </Text>
            </View>
          </View>
            </View>
            {/* Forecast for next day */}
            <View style={{ marginBottom: 8, marginVertical: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, gap: 8 }}>
                <CalendarDaysIcon size="22" color="white" style={{ marginTop: -9 }}/>
                <Text style={{ color: 'white', fontSize: 16, marginBottom:10 }}>Daily Forecast</Text>
              </View>
              <ScrollView
              horizontal
              contentContainerStyle= {{paddingHorizontal: 15}}
              showsHorizontalScrollIndicator = {false}>
                {
                  weather?.forecast?.forecastday?.map((item, index)=>{
                    let date = new Date(item.date);
                    let options = {weekday: 'long'};
                    let dayName = date.toLocaleDateString('en-US', options)
                    dayName = dayName.split(',')[0]

                    return (
                      <View
                      key = {index}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 96, // Assuming w-24 corresponds to 96px
                        borderRadius: 24, // Assuming rounded-3xl corresponds to 24px
                        paddingVertical: 12, // py-3 corresponds to 12px
                        marginRight: 16, // Assuming mr-4 corresponds to 16px
                        backgroundColor : theme.bgWhite(0.15)
                      }}>
                        <Image source={weatherImages[item?.day?.condition?.text]} style = {{height:44 , width :44}}/>
                        <Text style = {{color:"white"}}>{dayName}</Text>
                        <Text style = {{color:"white"}}>{item.date}</Text>
                        <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}
                        >
                          {item?.day?.avgtemp_c}&#176;
                        </Text>
                      </View>
                    )
                  })
                }
              </ScrollView>
            </View>
          </SafeAreaView>

      )
      }
    </View>
  );
}

