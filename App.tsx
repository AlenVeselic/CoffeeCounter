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
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
  ViewStyle,
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

interface Coffee {
  createdOn: string;
  modifiedOn: string;
  type: string;
}

const brightBrown = '#D2957B';
const darkBrown = '#3C251B';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [coffeeDrankToday, setCoffeeDrankToday] = useState(0);
  const [latestCoffee, setLatestCoffee] = useState<Coffee>();
  const [coffeDrankYesterday, setCoffeeDrankYesterday] = useState<any>(0);
  const [average, setAverage] = useState(0);
  const [selectedCaffeinatedBeverageType, setSelectedCaffeinatedBeverageType] =
    useState('Regular');

  const updateCoffeeAmount = async () => {
    const db = await connectToDatabase();

    await createCoffee(db, 0, 0, selectedCaffeinatedBeverageType);

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

  const mainContainerStyle: ViewStyle = {
    //backgroundColor: isDarkMode ? Colors.black : Colors.white,
    backgroundColor: darkBrown,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 100,
    height: useWindowDimensions().height + 7,
  };

  hideNavigationBar();

  return (
    <SafeAreaView style={[backgroundStyle, styles.screenMargin]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={brightBrown}
      />
      <View style={styles.headerContainer}>
        <Text style={[styles.libreFranklin, styles.headerText]}>
          Coffee counter
        </Text>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={[backgroundStyle, styles.highContrastBackground]}>
        <View style={[mainContainerStyle]}>
          <View style={styles.topInfoContainer}>
            <Text
              style={[styles.libreFranklin, styles.yesterdayCoffeeAmountText]}>
              {coffeDrankYesterday && coffeDrankYesterday > 0
                ? `You drank ${coffeDrankYesterday} coffees yesterday.`
                : 'No coffee drank yesterday.'}
            </Text>
            <Text style={[styles.libreFranklin, styles.dailyInfoText]}>
              On average you drink {average.toFixed(1)} coffees a day.
            </Text>
            <Text style={[styles.libreFranklin, styles.dailyInfoText]}>
              The last coffee you drank was at{' '}
              {latestCoffee?.createdOn
                ? new Date(latestCoffee.createdOn).toLocaleTimeString()
                : ''}
            </Text>
          </View>
          <View style={styles.counterContainer}>
            <View style={styles.coffeeAmountContainer}>
              <Text style={[styles.libreFranklin, styles.coffeeAmountText]}>
                {coffeeDrankToday}
              </Text>
            </View>
            <Pressable
              onPress={updateCoffeeAmount}
              style={styles.addCoffeeButton}>
              <Icon name="plus" size={100} color={darkBrown} />
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
  addCoffeeButton: {
    backgroundColor: brightBrown,
    marginVertical: 20,
    padding: 10,
    borderRadius: 200,
  },
  coffeeAmountText: {
    fontSize: 200,
    textAlign: 'center',
    color: darkBrown,

    flexShrink: 1,
  },
  coffeeAmountContainer: {
    position: 'relative',
    backgroundColor: brightBrown,
    borderRadius: 150,
    paddingVertical: 10,
    width: 300,
    height: 300,
  },
  dailyInfoText: {
    color: brightBrown,
    fontSize: 20,
    marginTop: 5,
  },
  yesterdayCoffeeAmountText: {
    color: brightBrown,
    fontSize: 25,
  },
  highContrastBackground: {
    // For testing
    backgroundColor: 'orange',
  },
  headerContainer: {
    backgroundColor: brightBrown,
    height: 50,
    display: 'flex',
    justifyContent: 'center',
  },
  headerText: {
    color: darkBrown,
    fontSize: 30,
    textAlign: 'center',
  },

  screenMargin: {marginTop: 20},
  topInfoContainer: {alignItems: 'center', marginTop: 125},
  counterContainer: {display: 'flex', alignItems: 'center'},
});

export default App;
