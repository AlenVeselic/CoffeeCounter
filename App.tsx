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
  Alert,
  Modal,
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
  getMoneySpentOnCoffeeToday,
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
type CaffeineType = {name: string; price: string};

const CaffeineTypes: CaffeineType[] = [
  {name: 'All', price: '0'},
  {name: 'Regular', price: '0'},
  {name: 'Shakespeare Extended', price: '1.8'},
  {name: 'Energy Drink', price: '2.5'},
];

const brightBrown = '#D2957B';
const darkBrown = '#3C251B';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [modalVisible, setModalVisible] = useState(false);

  const [coffeeDrankToday, setCoffeeDrankToday] = useState(0);
  const [latestCoffee, setLatestCoffee] = useState<Coffee>();
  const [coffeDrankYesterday, setCoffeeDrankYesterday] = useState<any>(0);
  const [average, setAverage] = useState(0);
  const [selectedCaffeinatedBeverageType, setSelectedCaffeinatedBeverageType] =
    useState<CaffeineType>(CaffeineTypes[2]);

  const [moneySpentToday, setMoneySpentToday] = useState('');

  const updateCoffeeAmount = async () => {
    const db = await connectToDatabase();

    await createCoffee(
      db,
      0,
      0,
      selectedCaffeinatedBeverageType.name,
      selectedCaffeinatedBeverageType.price,
    );

    await refresh();
  };

  const switchCaffeinatedBeverageType = (type: CaffeineType) => {
    setSelectedCaffeinatedBeverageType(type);
  };

  const refresh = async () => {
    const db = await connectToDatabase();

    setCoffeeDrankToday(
      await getTodaysCoffeeAmount(db, selectedCaffeinatedBeverageType.name),
    );
    setCoffeeDrankYesterday(await getYesterdaysCoffeeAmount(db));
    setAverage(await getDailyAverageCoffeeAmount(db));
    setLatestCoffee(await getLatestCoffee(db));
    setMoneySpentToday(await getMoneySpentOnCoffeeToday(db));
  };
  useEffect(() => {
    refresh();
    console.log('Switched to ', selectedCaffeinatedBeverageType.name);
  }, [selectedCaffeinatedBeverageType]);

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
              style={[
                styles.libreFranklin,
                styles.yesterdayCoffeeAmountText,
                {textAlignVertical: 'center', textAlign: 'center'},
              ]}>
              Selected beverage: {selectedCaffeinatedBeverageType.name}
              <Pressable
                onPress={() => setModalVisible(!modalVisible)}
                style={[
                  styles.addCoffeeButton,
                  {padding: 5, marginLeft: 10, marginBottom: -10},
                  selectedCaffeinatedBeverageType.name == 'All' && {
                    display: 'none',
                  },
                ]}>
                <Icon name="plus" size={30} color={darkBrown} />
              </Pressable>
            </Text>
            <Text
              style={[styles.libreFranklin, styles.yesterdayCoffeeAmountText]}>
              {coffeDrankYesterday && coffeDrankYesterday > 0
                ? `You drank ${coffeDrankYesterday} coffees yesterday.`
                : 'No coffee drank yesterday.'}
            </Text>
            <Text
              style={[styles.libreFranklin, styles.yesterdayCoffeeAmountText]}>
              {moneySpentToday && moneySpentToday > '0'
                ? `You have spent $${moneySpentToday} on coffee today.`
                : 'No money spent on coffee today.'}
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
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Pressable
                onPress={() => {
                  const caffeineTypeNames = CaffeineTypes.map(ct => ct.name);
                  const currentIndex = caffeineTypeNames.indexOf(
                    selectedCaffeinatedBeverageType.name,
                  );
                  const lastIndex =
                    (currentIndex - 1 + CaffeineTypes.length) %
                    CaffeineTypes.length;
                  console.log('Last index: ', lastIndex);
                  switchCaffeinatedBeverageType(CaffeineTypes[lastIndex]);
                }}
                style={{marginLeft: 20, marginRight: 5}}>
                <Icon name="leftcircleo" size={50} color={brightBrown} />
              </Pressable>
              <View style={styles.coffeeAmountContainer}>
                <Text style={[styles.libreFranklin, styles.coffeeAmountText]}>
                  {coffeeDrankToday}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  try {
                    const caffeineTypeNames = CaffeineTypes.map(ct => ct.name);
                    const currentIndex = caffeineTypeNames.indexOf(
                      selectedCaffeinatedBeverageType.name,
                    );
                    const nextIndex =
                      (currentIndex + 1 + CaffeineTypes.length) %
                      CaffeineTypes.length;

                    console.log('Next index: ', nextIndex);
                    switchCaffeinatedBeverageType(CaffeineTypes[nextIndex]);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                style={{marginRight: 20, marginLeft: 5}}>
                <Icon name="rightcircleo" size={50} color={brightBrown} />
              </Pressable>
            </View>
            <Pressable
              onPress={updateCoffeeAmount}
              style={[
                styles.addCoffeeButton,
                selectedCaffeinatedBeverageType.name == 'All' && {
                  display: 'none',
                },
              ]}>
              <Icon name="plus" size={100} color={darkBrown} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Hello World!</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.textStyle}>Hide Modal</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  caffeineTypeArrows: {
    fontSize: 30,
    color: brightBrown,
    marginHorizontal: 20,
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

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;
