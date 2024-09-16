/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// TODO: Support landscape mode or disable it
// TODO: Add support for looking at weeks, months, years statistics
// TODO: Ability to add monetary value to coffee drank and keep track of that too

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {
  connectToDatabase,
  createCoffee,
  createTables,
  getDailyAverageCoffeeAmount,
  getLatestCoffee,
  getTableNames,
  getTodaysCoffeeAmount,
  getYesterdaysCoffeeAmount,
} from './db/db';
import {hideNavigationBar} from 'react-native-navigation-bar-color';
import Icon from 'react-native-vector-icons/AntDesign';
import {SQLiteDatabase} from 'react-native-sqlite-storage';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [coffeeDrankToday, setCoffeeDrankToday] = useState(0);
  const [latestCoffee, setLatestCoffee] = useState(null);
  const [coffeDrankYesterday, setCoffeeDrankYesterday] = useState<any>(0);
  const [average, setAverage] = useState(0);

  const updateCoffeeAmount = async () => {
    const db = await connectToDatabase();

    await createCoffee(db);

    await refresh();
  };

  const refresh = async () => {
    const db = await connectToDatabase();

    setCoffeeDrankToday(await getTodaysCoffeeAmount(db));
    setCoffeeDrankYesterday(await getYesterdaysCoffeeAmount(db));
    setAverage(await getDailyAverageCoffeeAmount(db));
    setLatestCoffee(await getLatestCoffee(db));
  };

  const loadData = React.useCallback(async () => {
    // TODO: Initialize database, add communication with database
    try {
      const db = await connectToDatabase();
      await createTables(db);
      // await convertCoffeeDaysToCoffees(db);

      console.log(await getTableNames(db));

      await refresh();
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadData();

    const refreshTimer = setInterval(refresh, 30000);

    return () => {
      clearInterval(refreshTimer);
    };
  }, [loadData]);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const brightBrown = '#D2957B';
  const darkBrown = '#3C251B';

  hideNavigationBar();

  return (
    <SafeAreaView style={[backgroundStyle, {marginTop: 20}]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={brightBrown}
      />
      <View
        style={{
          backgroundColor: brightBrown,
          height: 50,
          display: 'flex',
          justifyContent: 'center',
        }}>
        <Text
          style={[
            styles.libreFranklin,
            {
              color: darkBrown,
              fontSize: 30,
              textAlign: 'center',
            },
          ]}>
          Coffee counter
        </Text>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[backgroundStyle, {backgroundColor: 'orange'}]}>
        <View
          style={{
            //backgroundColor: isDarkMode ? Colors.black : Colors.white,
            backgroundColor: darkBrown,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingBottom: 100,
            height: useWindowDimensions().height + 7,
          }}>
          <View style={{alignItems: 'center', marginTop: 125}}>
            <Text
              style={[
                styles.libreFranklin,
                {
                  color: brightBrown,
                  fontSize: 25,
                },
              ]}>
              {coffeDrankYesterday && coffeDrankYesterday > 0
                ? `You drank ${coffeDrankYesterday} coffees yesterday.`
                : 'No coffee drank yesterday.'}
            </Text>
            <Text
              style={[
                styles.libreFranklin,
                {
                  color: brightBrown,
                  fontSize: 20,
                  marginTop: 5,
                },
              ]}>
              On average you drink {average.toFixed(1)} coffees a day.
            </Text>
            <Text
              style={[
                styles.libreFranklin,
                {
                  color: brightBrown,
                  fontSize: 20,
                  marginTop: 5,
                },
              ]}>
              The last coffee you drank was at{' '}
              {new Date(latestCoffee?.createdOn).toLocaleTimeString()}
            </Text>
          </View>
          <View style={{display: 'flex', alignItems: 'center'}}>
            <View
              style={{
                position: 'relative',
                backgroundColor: brightBrown,
                borderRadius: 150,
                paddingVertical: 10,
                width: 300,
                height: 300,
              }}>
              <Text
                style={[
                  styles.libreFranklin,
                  {
                    fontSize: 200,
                    textAlign: 'center',
                    color: darkBrown,

                    flexShrink: 1,
                  },
                ]}>
                {coffeeDrankToday}
              </Text>
            </View>
            <Pressable
              onPress={updateCoffeeAmount}
              style={{
                backgroundColor: brightBrown,
                marginVertical: 20,
                padding: 10,
                borderRadius: 200,
              }}>
              <Icon name="plus" size={100} color={darkBrown}></Icon>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  libreFranklin: {
    fontFamily: 'LibreFranklin-Regular',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
