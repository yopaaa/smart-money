import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    title: 'Financial monitoring',
    description: 'Keep your incomes and expenses on track',
    illustration: 'financial',
  },
  {
    title: 'Smart Analytics',
    description: 'Get insights from your spending patterns',
    illustration: 'analytics',
  },
  {
    title: 'Your Data is Safe',
    description: 'You store your own data localy. You can backup and restore anytime.',
    illustration: 'security',
  },
];

import { Image } from 'react-native';

const renderIllustration = (type) => {
  let source;

  switch (type) {
    case 'financial':
      source = require('@/assets/illustrations/financial.jpg');
      break;
    case 'analytics':
      source = require('@/assets/illustrations/Analytics.jpg');

      break;
    case 'security':
      source = require('@/assets/illustrations/security.jpg');

      break;
    default:
      return null;
  }

  return (
    <View style={styles.illustrationBox}>
      <Image
        source={source}
        style={{ width: 340, height: 340, resizeMode: 'contain', borderRadius: 20 }}
      />
    </View>
  );
};


export default function FinancialOnboardingScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef(null);
  const router = useRouter();

  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      nextSlide(); // advance to next slide
    }, 5000); // setiap 3 detik

    return () => clearInterval(intervalRef.current); // clear saat unmount
  }, [currentSlide]);

  const handleScrollBegin = () => {
    clearInterval(intervalRef.current);
  };

  const goToSlide = (index) => {
    scrollRef.current.scrollTo({ x: index * (width - 40), animated: true });
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    const nextIndex = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    goToSlide(nextIndex);
  };

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(index);
  };

  return (
    <View style={styles.container}>
      <View style={{ justifyContent: "center", alignItems: "center" }}>

        <Text style={{ fontSize: 30, fontWeight: "800" }}>Herzlich willkommen</Text>
      </View>
      {/* Swiper area */}
      <View style={styles.sliderContainer}>
        <ScrollView
          onScrollBeginDrag={handleScrollBegin} // tambahkan ini
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide, index) => (
            <View key={index} style={styles.slide}>
              {renderIllustration(slide.illustration)}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Title and description */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{slides[currentSlide].title}</Text>
        <Text style={styles.description}>{slides[currentSlide].description}</Text>
      </View>

      {/* Indicator */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={[
              styles.indicatorDot,
              currentSlide === index && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.getStartedButton} onPress={() => {
          router.push("/Account")
        }}>
          <Text style={styles.getStartedText}>GET STARTED</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          const x = router.push("(backup)/_index")          
        }}>
          <Text style={styles.restoreText}>RESTORE DATA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: "center"
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
    // backgroundColor: "red",
    height: 400
  },
  slide: {
    width: width - 40,
    justifyContent: 'center',
    alignItems: 'center',
    // marginHorizontal: 10,
  },
  arrowButton: {
    position: 'absolute',
    // left: 0,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#666',
  },
  illustrationBox: {
    // margin: 50,
    width: 350,
    height: 350,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 30,
    // backgroundColor: "blue",
    height: 100,
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
  },
  buttonContainer: {
    // marginTop: 'auto',
    gap: 12,
  },
  getStartedButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  getStartedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  restoreText: {
    textAlign: 'center',
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '500',
  },
});
