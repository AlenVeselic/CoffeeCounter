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
  addCoffeeInDb,
  connectToDatabase,
  createTables,
  getDailyAverageCoffeeAmount,
  getTableNames,
  getTodaysCoffeeAmount,
  getYesterdaysCoffeeAmount,
} from './db/db';
import {hideNavigationBar} from 'react-native-navigation-bar-color';
import Icon from 'react-native-vector-icons/AntDesign';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [coffeeDrankToday, setCoffeeDrankToday] = useState(0);
  const [coffeDrankYesterday, setCoffeeDrankYesterday] = useState(0);
  const [average, setAverage] = useState(0);

  const updateCoffeeAmount = async () => {
    const db = await connectToDatabase();

    await addCoffeeInDb(db);

    setCoffeeDrankToday(await getTodaysCoffeeAmount(db));
  };

  const loadData = React.useCallback(async () => {
    // TODO: Initialize database, add communication with database
    try {
      const db = await connectToDatabase();
      await createTables(db);

      console.log(await getTableNames(db));

      setCoffeeDrankToday(await getTodaysCoffeeAmount(db));
      setCoffeeDrankYesterday(await getYesterdaysCoffeeAmount(db));
      setAverage(await getDailyAverageCoffeeAmount(db));
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadData();
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
